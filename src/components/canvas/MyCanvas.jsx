import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, OrbitControls, useProgress, Html } from '@react-three/drei'
import { Effects } from './Effects'
import { Lamborghini } from './Lamborghini'
import { Suspense, useRef } from 'react'

export default function MyCanvas() {
  function GroundGrid() {
    const gridRef = useRef()
    useFrame((state) => {
      const time = -state.clock.getElapsedTime()
      gridRef.current.position.z = time * Math.PI * 10
    })

    return (
      <gridHelper
        ref={gridRef}
        args={[9999, 490, 0xffffff, 0xffffff]}
        position={[0, -2, 0]}
        renderOrder={1}
        material-transparent
        material-opacity={0.2}
        material-depthWrite={false}
      />
    )
  }

  return (
    <Canvas
      gl={{ logarithmicDepthBuffer: true, antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 15], fov: 25 }}
    >
      <color attach='background' args={['#15151a']} />

      <GroundGrid />
      <Suspense fallback={<Loader />}>
        <Lamborghini rotation={[0, 0, 0]} scale={0.015} />
      </Suspense>
      <hemisphereLight intensity={0.5} />
      <ContactShadows
        resolution={1024}
        frames={1}
        position={[0, -1.16, 0]}
        scale={15}
        blur={0.5}
        opacity={1}
        far={20}
      />
      {/* We're building a cube-mapped environment declaratively.
          Anything you put in here will be filmed (once) by a cubemap-camera
          and applied to the scenes environment, and optionally background. */}
      <Environment preset='dawn' background />
      <Effects />
      <OrbitControls minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  )
}

//  ;<Environment resolution={512}>
//    {/* Ceiling */}
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 1, 1]} />
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -3]} scale={[10, 1, 1]} />
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
//    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
//    {/* Sides */}
//    <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-50, 2, 0]} scale={[100, 2, 1]} />
//    <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[50, 2, 0]} scale={[100, 2, 1]} />
//    {/* Key */}
//    <Lightformer
//      form='ring'
//      color='red'
//      intensity={10}
//      scale={2}
//      position={[10, 5, 10]}
//      onUpdate={(self) => self.lookAt(0, 0, 0)}
//    />
//  </Environment>

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
