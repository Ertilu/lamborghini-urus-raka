import { Canvas, useFrame } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Gltf, Environment, Fisheye, KeyboardControls, OrbitControls, useProgress, Html } from '@react-three/drei'
import Controller from 'ecctrl'
import { Suspense, useRef, useState } from 'react'

export default function App() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ]

  return (
    <div className='h-full'>
      <Canvas camera={{ position: [0, 2, 6] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />
        <RenderCar />
        <Environment preset='city' />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

function RenderCar() {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005
      ref.current.rotation.x += -0.005
    }
  })
  return (
    <Suspense fallback={<Loader />}>
      <Gltf ref={ref} src='/ford_gt3_10livis.glb' scale={100} />
    </Suspense>
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className='text-white text-lg'>Loading {progress.toFixed(0)}%</div>
    </Html>
  )
}

function RotatingBox() {
  const ref = useRef()
  useFrame(() => {
    ref.current.rotation.y += 0
    ref.current.rotation.x += 0.01
  })
  return (
    <mesh ref={ref}>
      <boxGeometry position={[10, 10, 10]} />
      <meshStandardMaterial color='orange' />

      {/* <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color='#ff6699' roughness={0.4} metalness={0.8} /> */}
    </mesh>
  )
}
