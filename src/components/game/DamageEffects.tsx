import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DamageEffects({ health }: { health: number }) {
  const smokeRef = useRef<THREE.Points>(null!);
  const sparkRef = useRef<THREE.Points>(null!);
  
  const smokeCount = 50;
  const smokePositions = useRef(new Float32Array(smokeCount * 3));
  const smokeVelocities = useRef(new Float32Array(smokeCount * 3));

  const sparkCount = 20;
  const sparkPositions = useRef(new Float32Array(sparkCount * 3));
  const sparkVelocities = useRef(new Float32Array(sparkCount * 3));

  useFrame((state) => {
    // Smoke logic (starts when health < 50)
    if (health < 50 && smokeRef.current) {
        const arr = smokeRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
           arr[i * 3 + 1] += 0.05; // Rise
           arr[i * 3] += (Math.random() - 0.5) * 0.02; // Drifting
           arr[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
           
           if (arr[i * 3 + 1] > 2) {
              arr[i * 3] = 0;
              arr[i * 3 + 1] = 0;
              arr[i * 3 + 2] = 0;
           }
        }
        smokeRef.current.geometry.attributes.position.needsUpdate = true;
        (smokeRef.current.material as THREE.PointsMaterial).opacity = (50 - health) / 100;
    }

    // Spark logic (starts when health < 25)
    if (health < 25 && sparkRef.current) {
       const arr = sparkRef.current.geometry.attributes.position.array as Float32Array;
       for (let i = 0; i < sparkCount; i++) {
          arr[i * 3] += (Math.random() - 0.5) * 0.2;
          arr[i * 3 + 1] += (Math.random() - 1) * 0.1;
          arr[i * 3 + 2] += (Math.random() - 0.5) * 0.2;

          if (arr[i * 3 + 1] < -0.5) {
             arr[i * 3] = 0;
             arr[i * 3 + 1] = 0;
             arr[i * 3 + 2] = 0;
          }
       }
       sparkRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0.2, 0.5]}>
      {health < 50 && (
        <points ref={smokeRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={smokeCount}
              array={smokePositions.current}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.4}
            color="#555555"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </points>
      )}

      {health < 25 && (
        <points ref={sparkRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkCount}
              array={sparkPositions.current}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#ffff00"
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
