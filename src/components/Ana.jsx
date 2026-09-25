import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Ana({ falando = false, ...props }) {
  const group = useRef();
  const boca = useRef();
  const braco = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (group.current) {
      group.current.position.y = Math.sin(t * 1.6) * 0.025;
    }

    if (boca.current) {
      const abertura = falando ? 0.45 + Math.abs(Math.sin(t * 12)) * 0.9 : 0.3;
      boca.current.scale.y = abertura;
    }

    if (braco.current) {
      braco.current.rotation.z = falando
        ? 0.22 + Math.sin(t * 2.4) * 0.12
        : 0.22;
    }
  });

  return (
    <group ref={group} {...props}>
      <mesh position={[-0.25, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.75, 8, 16]} />
        <meshStandardMaterial color="#325f8a" />
      </mesh>

      <mesh position={[0.25, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.75, 8, 16]} />
        <meshStandardMaterial color="#325f8a" />
      </mesh>

      <mesh position={[-0.25, 0.15, 0.08]} castShadow>
        <boxGeometry args={[0.38, 0.25, 0.62]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>

      <mesh position={[0.25, 0.15, 0.08]} castShadow>
        <boxGeometry args={[0.38, 0.25, 0.62]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>

      <mesh position={[0, 1.75, 0]} castShadow>
        <capsuleGeometry args={[0.52, 0.95, 10, 20]} />
        <meshStandardMaterial color="#e7f0d7" />
      </mesh>

      <mesh position={[0, 1.82, 0.43]} castShadow>
        <boxGeometry args={[0.78, 1.15, 0.18]} />
        <meshStandardMaterial color="#6b9f57" />
      </mesh>

      <mesh position={[-0.72, 1.8, 0]} rotation={[0, 0, -0.22]} castShadow>
        <capsuleGeometry args={[0.13, 0.85, 8, 16]} />
        <meshStandardMaterial color="#deb08b" />
      </mesh>

      <mesh
        ref={braco}
        position={[0.72, 1.8, 0]}
        rotation={[0, 0, 0.22]}
        castShadow
      >
        <capsuleGeometry args={[0.13, 0.85, 8, 16]} />
        <meshStandardMaterial color="#deb08b" />
      </mesh>

      <mesh position={[0, 2.9, 0]} castShadow>
        <sphereGeometry args={[0.58, 28, 28]} />
        <meshStandardMaterial color="#deb08b" />
      </mesh>

      <mesh position={[0, 3.08, -0.08]} scale={[1.06, 0.85, 1.05]} castShadow>
        <sphereGeometry args={[0.58, 24, 24]} />
        <meshStandardMaterial color="#573b2d" />
      </mesh>

      <mesh position={[0, 2.94, 0.35]} scale={[0.94, 0.8, 0.55]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#deb08b" />
      </mesh>

      <mesh position={[-0.19, 3.02, 0.62]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>

      <mesh position={[0.19, 3.02, 0.62]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>

      <mesh
        ref={boca}
        position={[0, 2.78, 0.64]}
        scale={[1, 0.3, 0.4]}
      >
        <sphereGeometry args={[0.095, 16, 16]} />
        <meshStandardMaterial color="#a95151" />
      </mesh>

      <mesh position={[0, 3.48, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.12, 24]} />
        <meshStandardMaterial color="#d7b365" />
      </mesh>

      <mesh position={[0, 3.68, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.52, 0.42, 24]} />
        <meshStandardMaterial color="#d7b365" />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
