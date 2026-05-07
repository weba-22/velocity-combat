import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Sparkles } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

export function WeatherSystem() {
  const time = useGameStore((state) => state.time);
  const weather = useGameStore((state) => state.weather);
  const setTime = useGameStore((state) => state.setTime);
  
  const sunPosition = useMemo(() => {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector3(
      Math.cos(angle) * 100,
      Math.sin(angle) * 100,
      0
    );
  }, [time]);

  const ambientIntensity = useMemo(() => {
    const hour = time % 24;
    if (hour > 6 && hour < 18) return 0.5; // Day
    if (hour > 18 && hour < 20) return 0.2 + (20 - hour) * 0.15; // Sunset
    if (hour > 4 && hour < 6) return 0.2 + (hour - 4) * 0.15; // Sunrise
    return 0.1; // Night
  }, [time]);

  const rainCount = 1000;
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  }, []);

  const rainRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    // Dynamic time progression (slow)
    if (useGameStore.getState().status === 'playing') {
      const nextTime = (time + 0.01) % 24;
      // We don't call setTime every frame to avoid store overhead, maybe every 10 frames?
      // Actually let's just do it slower or only if it changes significantly.
      if (Math.floor(nextTime * 100) !== Math.floor(time * 100)) {
         setTime(nextTime);
      }
    }

    if (weather === 'rain' || weather === 'storm') {
      const arr = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        arr[i * 3 + 1] -= 0.8; // Fall
        if (arr[i * 3 + 1] < 0) {
          arr[i * 3 + 1] = 50;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <Sky 
        sunPosition={sunPosition} 
        turbidity={weather === 'clear' ? 0.1 : 10} 
        rayleigh={weather === 'clear' ? 2 : 0.5}
        mieCoefficient={weather === 'clear' ? 0.005 : 0.1}
        mieDirectionalG={0.8}
      />
      
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={sunPosition} 
        intensity={ambientIntensity * 2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />

      {(weather === 'rain' || weather === 'storm') && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={rainCount}
              array={rainPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#aaaaff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      )}

      {weather === 'snow' && (
        <Sparkles 
          count={500} 
          scale={[50, 20, 100]} 
          size={2} 
          speed={0.5} 
          noise={1} 
          color="#ffffff" 
        />
      )}

      {weather === 'storm' && (
        <Sparkles 
           count={50} 
           scale={[100, 50, 100]} 
           size={10} 
           speed={10} 
           color="#ffffaa" 
           opacity={0.1}
        />
      )}
    </group>
  );
}
