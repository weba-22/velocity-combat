import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface GhostCarProps {
  position: [number, number, number];
  color: string;
  speed?: number;
}

export function GhostCar({ position, color, speed = 10 }: GhostCarProps) {
  const addEffect = useGameStore((state) => state.addEffect);
  const triggerShake = useGameStore((state) => state.triggerShake);

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1.2, 0.4, 2.5],
    onCollide: (e) => {
        const contactPos = e.contact.contactPoint;
        addEffect('hit', [contactPos[0], contactPos[1], contactPos[2]]);
        triggerShake(0.1);
    }
  }));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Simple pathfinding / movement logic
    const z = position[2] - (time * speed) % 200;
    const x = position[0] + Math.sin(time * 0.5) * 2;
    api.position.set(x, 0.5, z);
    api.rotation.set(0, Math.sin(time * 0.5) * 0.2, 0);
  });

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[1.2, 0.4, 2.5]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5} 
        transparent 
        opacity={0.6} 
      />
      {/* Ghost Glow */}
      <pointLight color={color} intensity={1} distance={5} />
    </mesh>
  );
}
