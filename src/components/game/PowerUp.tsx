import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { useSphere } from '@react-three/cannon';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface PowerUpProps {
  position: [number, number, number];
  type: 'missile' | 'shield' | 'nitro' | 'mine';
}

const TYPE_COLORS = {
  missile: '#ff4400',
  shield: '#00ccff',
  nitro: '#00ff44',
  mine: '#ffcc00',
};

export function PowerUp({ position, type }: PowerUpProps) {
  const setPowerUp = useGameStore((state) => state.setPowerUp);
  const [ref, api] = useSphere(() => ({
    position,
    args: [0.8],
    isTrigger: true,
    onCollide: () => {
      setPowerUp(type);
      api.position.set(position[0], -10, position[2]); // Move underground
      setTimeout(() => api.position.set(...position), 5000); // Respawn
    },
  }));

  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group ref={ref as any}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial 
            color={TYPE_COLORS[type]} 
            emissive={TYPE_COLORS[type]} 
            emissiveIntensity={4} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff"
        >
          {type.toUpperCase()}
        </Text>
      </Float>
       <pointLight color={TYPE_COLORS[type]} intensity={2} distance={5} />
    </group>
  );
}
