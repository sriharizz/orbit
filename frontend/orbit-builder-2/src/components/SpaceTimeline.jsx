import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, useGLTF, Gltf } from '@react-three/drei'; // 🔥 Removed Stars import
import * as THREE from 'three';
import gsap from 'gsap';

const PLANETS = [
  { id: 0, position: [0, 0, -10], orbitPosition: [0, 3.5, -10], label: "Planet Arrays", model: "/planet1.glb" }, 
  { id: 1, position: [100, 0, -10], orbitPosition: [100, 3.5, -10], label: "Planet Linked Lists", model: "/planet2.glb" }, 
  { id: 2, position: [200, 0, -10], orbitPosition: [200, 3.5, -10], label: "Planet Trees", model: "/planet3.glb" }, 
];

const SpaceshipModel = () => {
  const { scene } = useGLTF('/spaceship.glb'); 
  return (
    <primitive 
      object={scene} 
      scale={[0.2, 0.2, 0.2]} 
      position={[0, 0, 0]} 
      rotation={[0, 0, 0]} 
    /> 
  );
};

const PlanetModel = ({ modelPath }) => {
  return <Gltf src={modelPath} scale={[1, 1, 1]} />;
};

const Spaceship = ({ currentTopicIndex, isFlying, onArrival }) => {
  const shipRef = useRef();
  const engineLightRef = useRef();

  useEffect(() => {
    if (!shipRef.current || !isFlying) return;

    const targetPos = PLANETS[currentTopicIndex].orbitPosition;
    const startPos = shipRef.current.position;

    const tl = gsap.timeline({
      onComplete: () => {
        if (onArrival) onArrival();
      }
    });

    const dx = targetPos[0] - startPos.x;
    const dy = targetPos[1] - startPos.y;
    const dz = targetPos[2] - startPos.z;
    const targetAngle = Math.atan2(dx, dz);

    // ACT 1: THE MILLENNIUM FALCON SWOOP
    tl.to(shipRef.current.rotation, { 
        x: -0.2,         
        y: targetAngle, 
        z: 0.3,          
        duration: 1.5, 
        ease: "power2.inOut" 
      }, 0)
      .to(shipRef.current.position, {
        x: startPos.x + dx * 0.4, 
        y: startPos.y + dy * 0.4,
        z: startPos.z + dz * 0.4,
        duration: 1.5,
        ease: "power2.in"         
      }, 0)
      .to(engineLightRef.current, { intensity: 15, duration: 1.5 }, 0);

    // ACT 2: THE WARP JUMP 
    tl.to(shipRef.current.position, {
        x: startPos.x + dx * 0.9, 
        y: startPos.y + dy * 0.9,
        z: startPos.z + dz * 0.9,
        duration: 0.6, 
        ease: "none"
      }, 1.5);

    // ACT 3: THE CLOSE-UP HOVER
    tl.to(shipRef.current.rotation, { x: 0, y: targetAngle + Math.PI, z: 0, duration: 1.5, ease: "power2.out" }, 2.1)
      .to(shipRef.current.position, {
        x: targetPos[0],
        y: targetPos[1],
        z: targetPos[2],
        duration: 4.5, 
        ease: "power3.out" 
      }, 2.1)
      .to(engineLightRef.current, { intensity: 2, duration: 2 }, 3.0)
      .to(shipRef.current.rotation, { x: 0, y: targetAngle + (Math.PI / 2), duration: 2.5, ease: "power2.inOut" }, 3.5);

  }, [currentTopicIndex, isFlying]);

  useFrame((state) => {
    if (shipRef.current) {
      state.camera.position.lerp(
        new THREE.Vector3(
          shipRef.current.position.x - 3,  
          shipRef.current.position.y + 2,  
          shipRef.current.position.z + 10  
        ), 
        0.02 
      );
      
      const lookTarget = new THREE.Vector3(
        shipRef.current.position.x,
        shipRef.current.position.y - 1.5, 
        shipRef.current.position.z
      );
      state.camera.lookAt(lookTarget);
    }
  });

  return (
    <group ref={shipRef} position={[15, 20, 30]}> 
      <pointLight ref={engineLightRef} position={[0, 0, -2]} color="#4f46e5" intensity={2} distance={15} />
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <SpaceshipModel />
      </Float>
    </group>
  );
};

export default function SpaceTimeline({ currentTopicIndex, isFlying, onArrival }) {
  return (
    // 🔥 FIX 1: Changed 'bg-slate-950' to 'bg-transparent'
    <div className="w-full h-full bg-transparent absolute inset-0 z-0 overflow-hidden">
      
      {/* Set alpha to true so the canvas itself doesn't render a default background */}
      <Canvas shadows camera={{ position: [0, 2, 15], fov: 45 }} gl={{ alpha: true }}>
        <Suspense fallback={<Html center><div className="text-white font-mono tracking-widest text-xl">INITIALIZING GALAXY...</div></Html>}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} /> 
          <directionalLight position={[10, 20, 5]} intensity={1.5} />
          
          {/* 🔥 FIX 2: Completely deleted the local <Stars /> component here */}

          <Spaceship currentTopicIndex={currentTopicIndex} isFlying={isFlying} onArrival={onArrival} />
          
          {PLANETS.map((planet, index) => (
            <group key={planet.id} position={planet.position}>
              <PlanetModel modelPath={planet.model} />
              
              <Html position={[0, -3.5, 0]} center zIndexRange={[100, 0]}>
                <div className={`px-6 py-3 rounded shadow-[0_0_30px_rgba(79,70,229,0.3)] border-2 transition-all duration-1000 backdrop-blur-md
                  ${currentTopicIndex === index ? 'bg-indigo-900/80 border-indigo-500 scale-110' : 'bg-slate-900/50 border-slate-700 opacity-30'}`}>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                    {planet.label}
                  </p>
                </div>
              </Html>
            </group>
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/spaceship.glb');
useGLTF.preload('/planet1.glb');
useGLTF.preload('/planet2.glb');
useGLTF.preload('/planet3.glb');