'use client'
import React, { useRef, useMemo } from 'react'
import { applyProps, Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stats, useGLTF, useTexture, useEnvironment } from '@react-three/drei'
import * as THREE from 'three'

function FerrariScene() {
  const { scene } = useThree()
  const wheels = useRef([])

  // === Environment ===
  const environmentMap = useEnvironment({
    files: 'textures/equirectangular/venice_sunset_1k.hdr',
  })
  scene.environment = environmentMap
  scene.background = new THREE.Color(0x333333)
  scene.fog = new THREE.Fog(0x333333, 10, 15)

  // === Materials ===
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        metalness: 1.0,
        roughness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        color: 'rgb(158, 180, 215)',
      }),
    [],
  )

  const detailsMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.5,
      }),
    [],
  )

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.25,
        roughness: 0,
        transmission: 1.0,
      }),
    [],
  )

  // === Load Model ===
  const { scene: car, nodes, materials } = useGLTF('/models/ferrari.glb')
  console.log('NODES', nodes)
  console.log('MATERIALS', materials)

  useMemo(() => {
    if (!car) return
    car.getObjectByName('body').material = bodyMaterial
    car.getObjectByName('rim_fl').material = detailsMaterial
    car.getObjectByName('rim_fr').material = detailsMaterial
    car.getObjectByName('rim_rr').material = detailsMaterial
    car.getObjectByName('rim_rl').material = detailsMaterial
    car.getObjectByName('trim').material = detailsMaterial
    car.getObjectByName('glass').material = glassMaterial
    wheels.current = [
      car.getObjectByName('wheel_fl'),
      car.getObjectByName('wheel_fr'),
      car.getObjectByName('wheel_rl'),
      car.getObjectByName('wheel_rr'),
    ]
  }, [car, bodyMaterial, detailsMaterial, glassMaterial])

  // === Shadow Plane ===
  const shadowTexture = useTexture('/models/ferrari_ao.png')

  const shadow = useMemo(() => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true,
        premultipliedAlpha: true,
      }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.renderOrder = 2
    return mesh
  }, [shadowTexture])

  car.add(shadow)

  // === Animate wheels + ground offset ===
  useFrame((state) => {
    const time = -state.clock.getElapsedTime()
    wheels.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x = time * Math.PI * 2
    })
  })

  return <primitive object={car} />
}

function GroundGrid() {
  const gridRef = useRef()
  useFrame((state) => {
    const time = -state.clock.getElapsedTime()
    gridRef.current.position.z = -time % 1
  })

  return (
    <gridHelper
      ref={gridRef}
      args={[20, 40, 0xffffff, 0xffffff]}
      position={[0, 0, 0]}
      renderOrder={1}
      material-transparent
      material-opacity={0.2}
      material-depthWrite={false}
    />
  )
}

export default function FerrariViewer() {
  return (
    <div className='w-full h-screen' id='container'>
      <Canvas
        camera={{ position: [4.25, 1.4, -4.5], fov: 40, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
      >
        <ambientLight intensity={0.5} />
        <GroundGrid />
        <FerrariScene />
        <OrbitControls maxDistance={9} maxPolarAngle={Math.PI / 2} target={[0, 0.5, 0]} />
        <Stats />
      </Canvas>
    </div>
  )
}
