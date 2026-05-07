import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface MissileProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export function MissileProjectile({ id, position, rotation }: MissileProps) {
  const removeProjectile = useGameStore((state) => state.removeProjectile);
  const addEffect = useGameStore((state) => state.addEffect);
  const triggerShake = useGameStore((state) => state.triggerShake);
  const startTime = useRef(Date.now());
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.2],
    velocity: [
      Math.sin(rotation[1]) * -40,
      0,
      Math.cos(rotation[1]) * -40
    ],
    onCollide: (e) => {
       const contactPos = e.contact.contactPoint;
       addEffect('explosion', [contactPos[0], contactPos[1], contactPos[2]]);
       triggerShake(0.5);
       removeProjectile(id);
    }
  }));

  const particleCount = 100;
  const positions = useMemo(() => new Float32Array(particleCount * 3), []);
  const pointsRef = useRef<THREE.Points>(null!);
  const [trailPositions] = useState<THREE.Vector3[]>([]);

  useFrame((state) => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 3) { // Self-destruct after 3 seconds
      removeProjectile(id);
      return;
    }

    // Update trail
    if (ref.current && pointsRef.current) {
        const currentPos = new THREE.Vector3();
        ref.current.getWorldPosition(currentPos);
        
        trailPositions.unshift(currentPos.clone());
        if (trailPositions.length > particleCount) trailPositions.pop();

        for (let i = 0; i < trailPositions.length; i++) {
           positions[i * 3] = trailPositions[i].x;
           positions[i * 3 + 1] = trailPositions[i].y;
           positions[i * 3 + 2] = trailPositions[i].z;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={ref as any}>
        <cylinderGeometry args={[0.05, 0.1, 0.4, 8]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={5} />
        <pointLight color="#ff4400" intensity={2} distance={5} />
      </mesh>
      
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#ffaa00"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
