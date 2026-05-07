import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface EffectProps {
  id: string;
  position: [number, number, number];
  type: 'explosion' | 'nitro' | 'nitro-blast';
}

function Explosion({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  
  // Counts - Reduced for stability
  const CORE_COUNT = 400;
  const SMOKE_COUNT = 200;
  const DEBRIS_COUNT = 20;

  const [coreData, smokeData, debrisData] = useMemo(() => {
    const createBurst = (count: number, velocity: number, spread: number = 1) => {
      const pos = new Float32Array(count * 3);
      const stp = new Float32Array(count * 3);
      const size = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos(2 * Math.random() - 1);
        const r = (0.5 + Math.random() * 0.5) * velocity;
        
        stp[i * 3] = r * Math.sin(theta) * Math.cos(phi) * spread;
        stp[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        stp[i * 3 + 2] = r * Math.cos(theta) * spread;
        
        pos[i * 3] = position[0];
        pos[i * 3 + 1] = position[1];
        pos[i * 3 + 2] = position[2];
        size[i] = Math.random();
      }
      return { pos, stp, size };
    };

    // Debris needs rotation data too
    const debris = createBurst(DEBRIS_COUNT, 12, 1.2);
    const debrisRot = new Float32Array(DEBRIS_COUNT * 3);
    const debrisRotVel = new Float32Array(DEBRIS_COUNT * 3);
    for (let i = 0; i < DEBRIS_COUNT; i++) {
      debrisRotVel[i * 3] = (Math.random() - 0.5) * 0.5;
      debrisRotVel[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      debrisRotVel[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    return [
      createBurst(CORE_COUNT, 15, 1.2),
      createBurst(SMOKE_COUNT, 4, 1.5),
      { ...debris, rot: debrisRot, rotVel: debrisRotVel }
    ];
  }, [position]);

  const coreRef = useRef<THREE.Points>(null!);
  const smokeRef = useRef<THREE.Points>(null!);
  const debrisRef = useRef<THREE.InstancedMesh>(null!);
  const shockwaveRef = useRef<THREE.Mesh>(null!);
  const shockwaveRef2 = useRef<THREE.Mesh>(null!);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 2.0) {
      removeEffect(id);
      return;
    }

    // Update Core (Flash)
    if (coreRef.current) {
      const arr = coreRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < CORE_COUNT; i++) {
        arr[i * 3] += coreData.stp[i * 3] * 0.016;
        arr[i * 3 + 1] += coreData.stp[i * 3 + 1] * 0.016;
        arr[i * 3 + 2] += coreData.stp[i * 3 + 2] * 0.016;
        coreData.stp[i * 3] *= 0.95;
        coreData.stp[i * 3 + 1] *= 0.95;
        coreData.stp[i * 3 + 2] *= 0.95;
      }
      coreRef.current.geometry.attributes.position.needsUpdate = true;
      (coreRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - elapsed * 4);
      (coreRef.current.material as THREE.PointsMaterial).size = 0.5 * (1 - elapsed * 2);
    }

    // Update Smoke (Billowing)
    if (smokeRef.current) {
      const arr = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < SMOKE_COUNT; i++) {
        arr[i * 3] += smokeData.stp[i * 3] * 0.016;
        arr[i * 3 + 1] += smokeData.stp[i * 3 + 1] * 0.016 + 0.01; // Rise
        arr[i * 3 + 2] += smokeData.stp[i * 3 + 2] * 0.016;
        smokeData.stp[i * 3] *= 0.98;
        smokeData.stp[i * 3 + 1] *= 0.98;
        smokeData.stp[i * 3 + 2] *= 0.98;
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
      (smokeRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, (0.6 - elapsed * 0.3));
      (smokeRef.current.material as THREE.PointsMaterial).size = 0.8 + elapsed * 2; // Expand
    }

    // Update Debris (Instanced chunks)
    if (debrisRef.current) {
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        // Friction and gravity
        debrisData.stp[i * 3 + 1] -= 0.4; // Gravity
        
        debrisData.pos[i * 3] += debrisData.stp[i * 3] * 0.016;
        debrisData.pos[i * 3 + 1] += debrisData.stp[i * 3 + 1] * 0.016;
        debrisData.pos[i * 3 + 2] += debrisData.stp[i * 3 + 2] * 0.016;

        // Ground bounce
        if (debrisData.pos[i * 3 + 1] < 0) {
          debrisData.pos[i * 3 + 1] = 0;
          debrisData.stp[i * 3 + 1] *= -0.4; // Bounce damping
          debrisData.stp[i * 3] *= 0.8;
          debrisData.stp[i * 3 + 2] *= 0.8;
          // Stop rot vel
          debrisData.rotVel[i * 3] *= 0.5;
        }

        debrisData.rot[i * 3] += debrisData.rotVel[i * 3];
        debrisData.rot[i * 3 + 1] += debrisData.rotVel[i * 3 + 1];
        debrisData.rot[i * 3 + 2] += debrisData.rotVel[i * 3 + 2];

        dummy.position.set(debrisData.pos[i * 3], debrisData.pos[i * 3 + 1], debrisData.pos[i * 3 + 2]);
        dummy.rotation.set(debrisData.rot[i * 3], debrisData.rot[i * 3 + 1], debrisData.rot[i * 3 + 2]);
        const s = 0.1 + debrisData.size[i] * 0.2;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Shockwaves
    if (shockwaveRef.current) {
      shockwaveRef.current.scale.setScalar(1 + elapsed * 30);
      (shockwaveRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.8 - elapsed * 3);
    }
    if (shockwaveRef2.current) {
      shockwaveRef2.current.scale.setScalar(0.5 + elapsed * 45);
      (shockwaveRef2.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.4 - elapsed * 2.5);
    }
  });

  return (
    <group>
      {/* Core Flash */}
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CORE_COUNT} array={coreData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.5} color="#ffdd44" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Smoke Plumes */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={SMOKE_COUNT} array={smokeData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={1} color="#333333" transparent opacity={0.6} depthWrite={false} />
      </points>

      {/* Detailed Debris */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </instancedMesh>

      {/* Shockwaves */}
      <mesh ref={shockwaveRef} position={[position[0], 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 64]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={10} transparent />
      </mesh>
      <mesh ref={shockwaveRef2} position={[position[0], 0.06, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.0, 64]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} transparent />
      </mesh>

      <pointLight position={position} color="#ff8800" intensity={20} distance={20} />
    </group>
  );
}

function NitroBlastAggressive({ id, position }: { id: string; position: [number, number, number] }) {
  const removeEffect = useGameStore((state) => state.removeEffect);
  const startTime = useRef(Date.now());
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 0.6) {
      removeEffect(id);
      return;
    }

    if (ring1.current) {
      ring1.current.scale.setScalar(1 + elapsed * 35);
      (ring1.current.material as THREE.MeshStandardMaterial).opacity = 1 - elapsed * 1.6;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(0.5 + elapsed * 45);
      (ring2.current.material as THREE.MeshStandardMaterial).opacity = 0.8 - elapsed * 1.3;
    }
    if (ring3.current) {
      ring3.current.scale.setScalar(1.5 + elapsed * 25);
      (ring3.current.material as THREE.MeshStandardMaterial).opacity = 0.6 - elapsed;
    }
  });

  return (
    <group position={[position[0], 0.1, position[2]]}>
      <mesh ref={ring1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 64]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={20} transparent />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 64]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={15} transparent />
      </mesh>
      <mesh ref={ring3} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 64]} />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={10} transparent />
      </mesh>
      <pointLight color="#00ffff" intensity={20} distance={20} decay={2} />
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
          {effect.type === 'nitro-blast' && <NitroBlastAggressive id={effect.id} position={effect.position} />}
          {effect.type === 'shield' && <ShieldBlast id={effect.id} position={effect.position} />}
          {effect.type === 'hit' && <HitEffect id={effect.id} position={effect.position} />}
        </group>
      ))}
    </group>
  );
}
