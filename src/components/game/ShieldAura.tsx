import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ShieldAura() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Shimmering scale and pulse
      const pulse = Math.sin(time * 5) * 0.05 + 1;
      meshRef.current.scale.setScalar(pulse);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(time * 10) * 1;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
    if (ringRef.current) {
        ringRef.current.rotation.x = -Math.PI / 2;
        ringRef.current.rotation.z = time * 2;
        ringRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.1);
    }
  });

  return (
    <group scale={[1.8, 1, 3]}>
      {/* Main Aura Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={2} 
          transparent 
          opacity={0.15} 
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Horizontal Rings */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.1, 0.02, 16, 100]} />
        <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={10} 
            transparent 
            opacity={0.8} 
        />
      </mesh>
      
      <pointLight color="#00ffff" intensity={5} distance={10} />
    </group>
  );
}
