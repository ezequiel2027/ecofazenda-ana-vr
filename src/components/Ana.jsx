import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";

const MODELO_ANA = "/models/ana-ecocientista.glb";

/**
 * Ana humana da EcoFazenda.
 *
 * O GLB atual foi exportado sem rig e sem animações. Por isso o corpo fica
 * propositalmente estático: isso evita deformações no jaleco, braços e cabelo
 * no Quest 2. O prop `falando` é mantido para não alterar o fluxo existente de
 * voz/Gemini e poderá ser usado depois para a animação exclusiva da boca.
 */
export default function Ana({ falando = false, ...props }) {
  const { scene } = useGLTF(MODELO_ANA);

  // Há apenas uma Ana na cena, mas clonamos para manter o componente isolado
  // caso o modelo seja reutilizado no futuro.
  const modelo = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    modelo.traverse((objeto) => {
      if (objeto.isMesh) {
        objeto.castShadow = true;
        objeto.receiveShadow = true;
        objeto.frustumCulled = true;
      }
    });
  }, [modelo]);

  return (
    <group {...props}>
      {/*
        O GLB mede aproximadamente 1 unidade de altura e vem centralizado no
        eixo Y (-0.5 a +0.5). Com escala 1.8 e Y=0.9, os pés ficam no chão e
        a personagem fica com cerca de 1,80 m no cenário.
      */}
      <primitive
        object={modelo}
        scale={1.8}
        position={[0, 0.9, 0]}
      />

      {/* Sombra discreta no chão; não mexe no corpo da personagem. */}
      <mesh
        position={[0, 0.012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.48, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODELO_ANA);
