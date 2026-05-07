import { usePlane } from '@react-three/cannon';
import { MeshReflectorMaterial } from '@react-three/drei';

export function Track() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    onCollide: (e) => {
       // Floor collision
    }
  }));

  return (
    <group>
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
          mirror={1}
        />
      </mesh>
      
      {/* Neon Track Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[10, 200]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Side Walls */}
      <mesh position={[6, 1, 0]}>
        <boxGeometry args={[0.5, 2, 200]} />
        <meshStandardMaterial color="#222" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-6, 1, 0]}>
        <boxGeometry args={[0.5, 2, 200]} />
        <meshStandardMaterial color="#222" emissive="#ff00ff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
