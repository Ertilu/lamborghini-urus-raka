'use client'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Environment,
  Gltf,
  Html,
  KeyboardControls,
  OrbitControls,
  useGLTF,
  useKeyboardControls,
  useProgress,
} from '@react-three/drei'
import { forwardRef, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Box3, Vector3 } from 'three'
import * as THREE from 'three'
import { Physics, RigidBody, useRapier } from '@react-three/rapier'
import React from 'react'

const RenderCar = forwardRef((props, ref) => {
  const { scene } = useGLTF('/ford_gt3_10livis.glb')

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const yOffset = box.min.y
    scene.position.set(-center.x, -yOffset, -center.z)
  }, [scene])

  return <primitive ref={ref} object={scene} scale={100} {...props} />
})

function PlayerCar() {
  const bodyRef = useRef()
  const modelRef = useRef()
  const keys = useRef({})
  const speed = 10

  // Handle keyboard input (no re-renders)
  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true)
    const handleKeyUp = (e) => (keys.current[e.code] = false)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Apply movement
  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body) return

    body.wakeUp()

    const move = { x: 0, y: 0, z: 0 }
    if (keys.current['KeyW'] || keys.current['ArrowUp']) move.z -= 1
    if (keys.current['KeyS'] || keys.current['ArrowDown']) move.z += 1
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) move.x -= 1
    if (keys.current['KeyD'] || keys.current['ArrowRight']) move.x += 1

    const magnitude = Math.hypot(move.x, move.z)
    if (magnitude > 0) {
      move.x /= magnitude
      move.z /= magnitude
    }

    // Apply linear velocity
    body.setLinvel(
      {
        x: move.x * speed,
        y: body.linvel().y,
        z: move.z * speed,
      },
      true,
    )

    // Sync model position & rotation to physics body
    const t = body.translation()
    if (modelRef.current) {
      modelRef.current.position.copy(new THREE.Vector3(t.x, t.y, t.z))
      modelRef.current.rotation.copy(body.rotation())
    }
  })

  return (
    <RigidBody
      ref={bodyRef}
      position={[0, 2, 0]}
      friction={0.5}
      restitution={0.2}
      canSleep={false}
      linearDamping={2}
      colliders='cuboid'
    >
      <RenderCar ref={modelRef} />
    </RigidBody>
  )
}

function CheckerGround() {
  const texture = useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const context = canvas.getContext('2d')
    const colors = ['#888888', '#4a4a4a']

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        context.fillStyle = colors[(x + y) % 2]
        context.fillRect((x * size) / 8, (y * size) / 8, size / 8, size / 8)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(20, 20)
    return texture
  }, [])

  return (
    <RigidBody type='fixed' friction={1} restitution={0}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </RigidBody>
  )
}

export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }} gl={{ physicallyCorrectLights: true }}>
      <color attach='background' args={['#202020']} />
      <fog attach='fog' args={['#202020', 10, 100]} />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Ground */}
        <CheckerGround />

        {/* Car / Cube Controller */}
        <Loader />
        <Suspense fallback={<Loader />}>
          <PlayerCar />
        </Suspense>
        {/* </KeyboardControls> */}
      </Physics>

      {/* Environment & Controls */}
      <Environment preset='city' background />
      {/* 3D Model */}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.3}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  )
}

function InfiniteGround() {
  const ref = useRef()
  const { camera } = useThree()

  // Make the plane follow the camera’s position
  useFrame(() => {
    ref.current.position.x = camera.position.x
    ref.current.position.z = camera.position.z
  })

  // Create repeating texture
  const texture = new THREE.TextureLoader().load('/Road007_2K-PNG/Road007_2K-PNG_Roughness.png')
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1000, 1000)
  texture.anisotropy = 16

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className='flex flex-col items-center text-white'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-2'></div>
        <p>{progress.toFixed(0)}%</p>
      </div>
    </Html>
  )
}
