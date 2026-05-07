import { Canvas } from '@react-three/fiber';
import { Sky, ContactShadows, Environment, Stars } from '@react-three/drei';
import { Physics, Debug } from '@react-three/cannon';
import { Car } from './Car';
import { Track } from './Track';
import { useGameStore } from '../../store/useGameStore';
import { PowerUp } from './PowerUp';
import { VFXManager } from './VFXManager';
import { MissileProjectile } from './MissileProjectile';
import { Mine } from './Mine';

import { GhostCar } from './GhostCar';

export function Scene() {
  const status = useGameStore((state) => state.status);
  const projectiles = useGameStore((state) => state.projectiles);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 12], fov: 50 }}
      className="w-full h-full bg-black"
    >
      <fog attach="fog" args={['#000', 10, 50]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
      
      <Physics gravity={[0, -9.81, 0]} tolerance={0.001}>
        <Track />
        {status !== 'menu' && (
          <>
            <Car />
            <GhostCar position={[3, 0.5, -20]} color="#ff0044" speed={12} />
            <GhostCar position={[-3, 0.5, -40]} color="#00ffff" speed={15} />
            <GhostCar position={[2, 0.5, -60]} color="#ffff00" speed={10} />
          </>
        )}
        
        {projectiles.map((p) => (
          p.type === 'missile' ? (
            <MissileProjectile key={p.id} id={p.id} position={p.position} rotation={p.rotation} />
          ) : (
            <Mine key={p.id} id={p.id} position={p.position} />
          )
        ))}

        <PowerUp position={[0, 1, -20]} type="missile" />
        <PowerUp position={[4, 1, -40]} type="shield" />
        <PowerUp position={[-4, 1, -60]} type="nitro" />
        <PowerUp position={[0, 1, -80]} type="mine" />
        <PowerUp position={[2, 1, -100]} type="missile" />
      </Physics>

      <VFXManager />

      <Environment preset="night" />
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.35} far={10} color="#000" />
    </Canvas>
  );
}
