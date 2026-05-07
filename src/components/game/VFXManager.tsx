import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface EffectProps {
  id: string;
  position: [number, number, number];
  type: 'explosion' | 'nitro';
}

function Explosion({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  
  // Layers: 0 = Core, 1 = Smoke, 2 = Debris
  const CORE_COUNT = 800;
  const SMOKE_COUNT = 400;
  const DEBRIS_COUNT = 50;

  const [coreData, smokeData, debrisData] = useMemo(() => {
    const createBurst = (count: number, velocity: number, spread: number = 1) => {
      const pos = new Float32Array(count * 3);
      const stp = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos(2 * Math.random() - 1);
        const r = Math.random() * velocity;
        
        stp[i * 3] = r * Math.sin(theta) * Math.cos(phi) * spread;
        stp[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        stp[i * 3 + 2] = r * Math.cos(theta) * spread;
        
        pos[i * 3] = position[0];
        pos[i * 3 + 1] = position[1];
        pos[i * 3 + 2] = position[2];
      }
      return { pos, stp };
    };

    return [
      createBurst(CORE_COUNT, 1.5, 1.2),
      createBurst(SMOKE_COUNT, 0.4, 0.8),
      createBurst(DEBRIS_COUNT, 2.0, 1.5)
    ];
  }, [position]);

  const coreRef = useRef<THREE.Points>(null!);
  const smokeRef = useRef<THREE.Points>(null!);
  const debrisRef = useRef<THREE.Points>(null!);
  const shockwaveRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 1.5) {
      removeEffect(id);
      return;
    }

    // Update Core (Rapid expansion, fast fade)
    if (coreRef.current) {
      const arr = coreRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < CORE_COUNT; i++) {
        arr[i * 3] += coreData.stp[i * 3] * 0.15;
        arr[i * 3 + 1] += coreData.stp[i * 3 + 1] * 0.15;
        arr[i * 3 + 2] += coreData.stp[i * 3 + 2] * 0.15;
      }
      coreRef.current.geometry.attributes.position.needsUpdate = true;
      (coreRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - elapsed * 2);
    }

    // Update Smoke (Slower, rising)
    if (smokeRef.current) {
      const arr = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < SMOKE_COUNT; i++) {
        arr[i * 3] += smokeData.stp[i * 3] * 0.05;
        arr[i * 3 + 1] += smokeData.stp[i * 3 + 1] * 0.05 + 0.02; // Rise up
        arr[i * 3 + 2] += smokeData.stp[i * 3 + 2] * 0.05;
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
      (smokeRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, 0.6 - elapsed * 0.4);
    }

    // Update Debris (Gravity physics)
    if (debrisRef.current) {
      const arr = debrisRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        arr[i * 3] += debrisData.stp[i * 3] * 0.1;
        debrisData.stp[i * 3 + 1] -= 0.05; // Gravity
        arr[i * 3 + 1] += debrisData.stp[i * 3 + 1] * 0.1;
        arr[i * 3 + 2] += debrisData.stp[i * 3 + 2] * 0.1;
        if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 0; // Ground bounce-ish
      }
      debrisRef.current.geometry.attributes.position.needsUpdate = true;
      (debrisRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - elapsed);
    }

    // Update Shockwave
    if (shockwaveRef.current) {
      shockwaveRef.current.scale.setScalar(1 + elapsed * 15);
      (shockwaveRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.8 - elapsed * 2);
    }
  });

  return (
    <group>
      {/* Core Blast */}
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CORE_COUNT} array={coreData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#ffaa00" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Smoke */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={SMOKE_COUNT} array={smokeData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.6} color="#444444" transparent opacity={0.5} depthWrite={false} />
      </points>

      {/* Debris */}
      <points ref={debrisRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={DEBRIS_COUNT} array={debrisData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#222222" transparent />
      </points>

      {/* Secondary Shockwave */}
      <mesh ref={shockwaveRef} position={[position[0], 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={5} transparent />
      </mesh>

      <pointLight position={position} color="#ff6600" intensity={5} distance={15} />
    </group>
  );
}

function NitroBlast({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 0.5) {
      removeEffect(id);
      return;
    }

    if (meshRef.current) {
        meshRef.current.scale.setScalar(1 + elapsed * 20);
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - elapsed * 2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.5, 0.6, 32]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#00ffff" 
        emissiveIntensity={10} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function ShieldBlast({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 0.8) {
      removeEffect(id);
      return;
    }

    if (meshRef.current) {
        meshRef.current.scale.setScalar(2 + elapsed * 5);
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity = (1 - elapsed) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#0066ff" 
        emissive="#0066ff" 
        emissiveIntensity={5} 
        transparent 
        wireframe
      />
    </mesh>
  );
}

function HitEffect({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  const COUNT = 12;

  const [sparkData] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const stp = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 2 + Math.random() * 4;
        
        stp[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
        stp[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
        stp[i * 3 + 2] = speed * Math.cos(phi);
        
        pos[i * 3] = position[0];
        pos[i * 3 + 1] = position[1];
        pos[i * 3 + 2] = position[2];
    }
    return [{ pos, stp }];
  }, [position]);

  const pointsRef = useRef<THREE.Points>(null!);
  const flashRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 0.4) {
      removeEffect(id);
      return;
    }

    if (pointsRef.current) {
        const arr = pointsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < COUNT; i++) {
            arr[i * 3] += sparkData.stp[i * 3] * 0.05;
            arr[i * 3 + 1] += sparkData.stp[i * 3 + 1] * 0.05;
            arr[i * 3 + 2] += sparkData.stp[i * 3 + 2] * 0.05;
            sparkData.stp[i * 3 + 1] -= 0.2; // Gravity
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        (pointsRef.current.material as THREE.PointsMaterial).opacity = 1 - elapsed * 2.5;
    }

    if (flashRef.current) {
        flashRef.current.scale.setScalar(0.5 + elapsed * 10);
        (flashRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - elapsed * 4;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT} array={sparkData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#00ffff" transparent blending={THREE.AdditiveBlending} />
      </points>
      <mesh ref={flashRef} position={position}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={10} transparent />
      </mesh>
      <pointLight position={position} color="#00ffff" intensity={10} distance={5} />
    </group>
  );
}

function ScorchMark({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 5) {
      removeEffect(id);
      return;
    }
    if (meshRef.current) {
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, (1 - elapsed / 5) * 0.4);
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.5, 16]} />
      <meshStandardMaterial color="#000000" transparent opacity={0.4} depthWrite={false} />
    </mesh>
  );
}

export function VFXManager() {
  const effects = useGameStore((state) => state.effects);

  return (
    <group>
      {effects.map((effect) => (
        <group key={effect.id}>
          {effect.type === 'explosion' && (
            <>
               <Explosion id={effect.id} position={effect.position} />
               <ScorchMark id={effect.id + '_scorch'} position={effect.position} />
            </>
          )}
          {effect.type === 'nitro' && <NitroBlast id={effect.id} position={effect.position} />}
          {effect.type === 'shield' && <ShieldBlast id={effect.id} position={effect.position} />}
          {effect.type === 'hit' && <HitEffect id={effect.id} position={effect.position} />}
        </group>
      ))}
    </group>
  );
}
