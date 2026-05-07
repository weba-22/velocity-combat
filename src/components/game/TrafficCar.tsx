import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function TrafficCar({ position, speed = 8 }: { position: [number, number, number], speed?: number }) {
  const addEffect = useGameStore((state) => state.addEffect);
  const triggerShake = useGameStore((state) => state.triggerShake);

  const [ref, api] = useBox(() => ({
    mass: 1000,
    position,
    args: [1.2, 0.4, 2],
    onCollide: (e) => {
      const contactPos = e.contact.contactPoint;
      addEffect('hit', [contactPos[0], contactPos[1], contactPos[2]]);
      triggerShake(0.15);
    }
  }));

  useFrame(() => {
    // Traffic moves in a straight line for now
    api.velocity.set(0, 0, speed);
    
    // Looping logic (could be improved with a proper traffic manager)
    if (ref.current && ref.current.position.z > 50) {
      api.position.set(position[0], position[1], -150);
    }
  });

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[1.2, 0.4, 2]} />
      <meshStandardMaterial color="#555" metalness={0.5} roughness={0.5} />
      {/* Brake lights */}
      <mesh position={[0, 0.1, -1]}>
        <boxGeometry args={[1, 0.1, 0.05]} />
        <meshBasicMaterial color="#330000" />
      </mesh>
    </mesh>
  );
}
