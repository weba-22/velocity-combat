import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface MineProps {
  id: string;
  position: [number, number, number];
}

export function Mine({ id, position }: MineProps) {
  const removeProjectile = useGameStore((state) => state.removeProjectile);
  const addEffect = useGameStore((state) => state.addEffect);
  const triggerShake = useGameStore((state) => state.triggerShake);
  const [isActive, setIsActive] = useState(false);
  const startTime = useRef(Date.now());

  const [ref, api] = useSphere(() => ({
    mass: 10,
    position,
    args: [0.4],
    onCollide: (e) => {
      if (!isActive && Date.now() - startTime.current < 500) return; // Prevention for self-collision on drop
      
      const contactPos = e.contact.contactPoint;
      addEffect('explosion', [contactPos[0], contactPos[1], contactPos[2]]);
      triggerShake(0.6);
      removeProjectile(id);
    }
  }));

  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // Arming logic
    if (!isActive && elapsed > 1) {
      setIsActive(true);
    }

    if (meshRef.current) {
      // Pulse effect
      const pulse = Math.sin(state.clock.getElapsedTime() * (isActive ? 10 : 2)) * 0.5 + 0.5;
      meshRef.current.scale.setScalar(0.8 + pulse * 0.2);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + pulse * 10;
    }
  });

  return (
    <group ref={ref as any}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#222" 
          emissive={isActive ? "#ff0000" : "#ffcc00"} 
          emissiveIntensity={2} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      {/* Proximity Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <ringGeometry args={[0.5, 0.6, 32]} />
        <meshBasicMaterial color={isActive ? "#ff0000" : "#ffcc00"} transparent opacity={0.3} />
      </mesh>
      <pointLight color={isActive ? "#ff0000" : "#ffcc00"} intensity={2} distance={3} />
    </group>
  );
}
