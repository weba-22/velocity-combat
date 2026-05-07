import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useRaycastVehicle, useBox } from '@react-three/cannon';
import { useControls } from '../../hooks/useControls';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

const WHEEL_RADIUS = 0.3;
const WHEEL_WIDTH = 0.2;

import { ShieldAura } from './ShieldAura';
import { DamageEffects } from './DamageEffects';

export function Car() {
  const { camera } = useThree();
  const controls = useControls();
  
  const status = useGameStore((state) => state.status);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const shake = useGameStore((state) => state.shake);
  const setShake = useGameStore((state) => state.setShake);
  const isShielded = useGameStore((state) => state.isShielded);
  const setShielded = useGameStore((state) => state.setShielded);
  const setHealth = useGameStore((state) => state.setHealth);
  const health = useGameStore((state) => state.health);
  const lap = useGameStore((state) => state.lap);
  const setLap = useGameStore((state) => state.setLap);
  const totalLaps = useGameStore((state) => state.totalLaps);
  const finishGame = useGameStore((state) => state.finishGame);
  const score = useGameStore((state) => state.score);
  const usePowerUp = useGameStore((state) => state.setPowerUp);
  const currentPowerUp = useGameStore((state) => state.powerUp);
  const addEffect = useGameStore((state) => state.addEffect);
  const addProjectile = useGameStore((state) => state.addProjectile);
  const triggerShake = useGameStore((state) => state.triggerShake);

  const chassisRef = useRef<THREE.Group>(null!);
  const lastZ = useRef(0);

  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: [1.2, 0.4, 2.5],
    mass: 500,
    position: [0, 0.5, 0],
    onCollide: (e) => {
       const contactPos = e.contact.contactPoint;
       addEffect('hit', [contactPos[0], contactPos[1], contactPos[2]]);
       triggerShake(0.2);
       
       if (!isShielded) {
          const newHealth = health - 5;
          setHealth(newHealth);
          if (newHealth <= 0) {
            finishGame();
          }
       }
    }
  }), useRef<THREE.Mesh>(null));

  const wheelRefs = [
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
  ];

  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody,
    wheels: wheelRefs,
    wheelInfos: [
      // Front Left
      {
        radius: WHEEL_RADIUS,
        directionLocal: [0, -1, 0],
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        steering: 0.5,
        axleLocal: [-1, 0, 0],
        chassisConnectionPointLocal: [-0.6, 0.1, 1],
        isFrontWheel: true,
      },
      // Front Right
      {
        radius: WHEEL_RADIUS,
        directionLocal: [0, -1, 0],
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        steering: 0.5,
        axleLocal: [-1, 0, 0],
        chassisConnectionPointLocal: [0.6, 0.1, 1],
        isFrontWheel: true,
      },
      // Back Left
      {
        radius: WHEEL_RADIUS,
        directionLocal: [0, -1, 0],
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        steering: 0,
        axleLocal: [-1, 0, 0],
        chassisConnectionPointLocal: [-0.6, 0.1, -1],
        isFrontWheel: false,
      },
      // Back Right
      {
        radius: WHEEL_RADIUS,
        directionLocal: [0, -1, 0],
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        steering: 0,
        axleLocal: [-1, 0, 0],
        chassisConnectionPointLocal: [0.6, 0.1, -1],
        isFrontWheel: false,
      },
    ],
  }));

  useEffect(() => {
    const unsubscribe = chassisApi.velocity.subscribe((v) => {
      const vel = new THREE.Vector3(v[0], v[1], v[2]);
      setSpeed(Math.floor(vel.length() * 3.6));
    });
    return unsubscribe;
  }, [chassisApi.velocity, setSpeed]);

  useFrame((state) => {
    // Camera follow always runs if car exists
    if (chassisBody.current) {
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      chassisBody.current.getWorldPosition(position);
      chassisBody.current.getWorldQuaternion(quaternion);

      const offset = new THREE.Vector3(0, 3, 8).applyQuaternion(quaternion);
      const lookAt = new THREE.Vector3(0, 0, -5).applyQuaternion(quaternion);
      
      const shakeOffset = new THREE.Vector3(
        (Math.random() - 0.5) * shake,
        (Math.random() - 0.5) * shake,
        (Math.random() - 0.5) * shake
      );

      camera.position.lerp(position.clone().add(offset).add(shakeOffset), 0.1);
      camera.lookAt(position.clone().add(lookAt));

      if (shake > 0) {
        setShake(Math.max(0, shake - 0.02));
      }
      
      // Lap crossing logic
      if (status === 'playing') {
        if (lastZ.current < 0 && position.z >= 0) {
          if (lap < totalLaps) {
            setLap(lap + 1);
          } else {
            finishGame();
          }
        }
      }
      lastZ.current = position.z;
    }

    // Only allow control if playing
    if (status !== 'playing') {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
      vehicleApi.setSteeringValue(0, 0);
      vehicleApi.setSteeringValue(0, 1);
      return;
    }

    const { forward, backward, left, right, brake, action } = controls;
    
    // Power-up activation
    if (action && currentPowerUp && chassisBody.current) {
       const position = new THREE.Vector3();
       const quaternion = new THREE.Quaternion();
       chassisBody.current.getWorldPosition(position);
       chassisBody.current.getWorldQuaternion(quaternion);
       
       const posArray: [number, number, number] = [position.x, position.y, position.z];
       const rotArray: [number, number, number] = [0, new THREE.Euler().setFromQuaternion(quaternion).y, 0];

       if (currentPowerUp === 'nitro') {
          addEffect('nitro-blast', posArray);
          chassisApi.applyImpulse([0, 0, -2000], [0, 0, 0]);
          triggerShake(0.3);
       } else if (currentPowerUp === 'missile') {
          const offset = new THREE.Vector3(0, 0, -2).applyQuaternion(quaternion);
          addProjectile('missile', [position.x + offset.x, position.y + offset.y, position.z + offset.z], rotArray);
          triggerShake(0.1);
       } else if (currentPowerUp === 'shield') {
          addEffect('shield', posArray);
          triggerShake(0.05);
          setShielded(true);
          setTimeout(() => setShielded(false), 5000);
       } else if (currentPowerUp === 'mine') {
          const offset = new THREE.Vector3(0, 0, 2).applyQuaternion(quaternion);
          addProjectile('mine', [position.x + offset.x, position.y + offset.y, position.z + offset.z], rotArray);
          triggerShake(0.2);
       }
       
       usePowerUp(null); 
    }

    const engineForce = forward ? 1500 : backward ? -800 : 0;
    const steeringValue = left ? 0.5 : right ? -0.5 : 0;
    const brakeForce = brake ? 50 : 0;

    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);
    vehicleApi.setSteeringValue(steeringValue, 0);
    vehicleApi.setSteeringValue(steeringValue, 1);
    vehicleApi.setBrake(brakeForce, 0);
    vehicleApi.setBrake(brakeForce, 1);
    vehicleApi.setBrake(brakeForce, 2);
    vehicleApi.setBrake(brakeForce, 3);
  });

  return (
    <group ref={vehicle}>
      <mesh ref={chassisBody} castShadow>
        {isShielded && <ShieldAura />}
        <DamageEffects health={health} />
        <boxGeometry args={[1.2, 0.4, 2.5]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.2} />
        {/* Glowing Headlights */}
        <mesh position={[0.4, 0.1, 1.25]}>
          <boxGeometry args={[0.2, 0.1, 0.1]} />
          <meshBasicMaterial color={health > 30 ? "#00ffff" : health > 0 && Math.random() > 0.5 ? "#00ffff" : "#222"} />
        </mesh>
        <mesh position={[-0.4, 0.1, 1.25]}>
          <boxGeometry args={[0.2, 0.1, 0.1]} />
          <meshBasicMaterial color={health > 40 ? "#00ffff" : health > 0 && Math.random() > 0.5 ? "#00ffff" : "#222"} />
        </mesh>
        {/* Tail lights */}
        <mesh position={[0, 0.1, -1.25]}>
           <boxGeometry args={[1.2, 0.1, 0.1]} />
           <meshBasicMaterial color="#ff0044" />
        </mesh>
      </mesh>
      {/* Simple Wheels */}
      {wheelRefs.map((ref, i) => (
        <Wheel key={i} index={i} radius={WHEEL_RADIUS} wheelRef={ref} />
      ))}
    </group>
  );
}

function Wheel({ index, radius, wheelRef }: any) {
  return (
    <group ref={wheelRef}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius, radius, WHEEL_WIDTH, 16]} />
        <meshStandardMaterial color="#111" roughness={1} />
      </mesh>
    </group>
  );
}
