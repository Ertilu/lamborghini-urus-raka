'use client'

import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Gltf, Environment, Fisheye, KeyboardControls, useGLTF } from '@react-three/drei'
import Controller from 'ecctrl'
import { forwardRef } from 'react'
import './styles.css'

function CharacterModel() {
  const { scene } = useGLTF('/ghost_w_tophat-transformed.glb')
  return <primitive object={scene} />
}

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
    <>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
          <Environment files='/night.hdr' ground={{ scale: 100 }} />
          <directionalLight intensity={0.8} position={[10, 10, 5]} />
          <ambientLight intensity={0.3} />

          <Physics>
            {/* ✅ ecctrl v1 only works if child is a Three.js group or primitive */}
            <Controller cam characterInitPos={[0, 2, 0]} maxVelLimit={5} jumpVel={5} debug>
              <group scale={0.3} position={[0, -0.55, 0]}>
                <CharacterModel />
              </group>
            </Controller>

            <RigidBody type='fixed' colliders='trimesh'>
              <primitive
                object={useGLTF('/fantasy_game_inn2-transformed.glb').scene}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.1}
              />
            </RigidBody>
          </Physics>
        </Canvas>
      </KeyboardControls>

      <img className='controlKeys' src='/controls.png' alt='control keys' />
    </>
  )
}
