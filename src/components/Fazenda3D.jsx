import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Text } from "@react-three/drei";
import { Suspense, useRef } from "react";
import Ana from "./Ana";
import { XR, createXRStore } from "@react-three/xr";

const xrStore = createXRStore();

function Arvore({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 2, 10]} />
        <meshStandardMaterial color="#76502f" />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.9, 18, 18]} />
        <meshStandardMaterial color="#438a45" />
      </mesh>
    </group>
  );
}

function Cerca() {
  const postes = [-7, -5, -3, -1, 1, 3, 5, 7];
  return (
    <group position={[0, 0, -5.8]}>
      {postes.map((x) => (
        <mesh key={x} position={[x, 0.65, 0]} castShadow>
          <boxGeometry args={[0.13, 1.3, 0.13]} />
          <meshStandardMaterial color="#8b603b" />
        </mesh>
      ))}
      {[0.45, 0.9].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[14.2, 0.1, 0.12]} />
          <meshStandardMaterial color="#9c7047" />
        </mesh>
      ))}
    </group>
  );
}

function Canteiro({ position, cor = "#5f8f3f" }) {
  const plantas = [];
  for (let x = -1.55; x <= 1.55; x += 0.52) {
    for (let z = -0.55; z <= 0.55; z += 0.55) {
      plantas.push([x, z]);
    }
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[4, 0.24, 1.8]} />
        <meshStandardMaterial color="#6a452d" />
      </mesh>
      <mesh position={[0, 0.24, 0]} receiveShadow>
        <boxGeometry args={[3.75, 0.16, 1.55]} />
        <meshStandardMaterial color="#4c3021" />
      </mesh>
      {plantas.map(([x, z], i) => (
        <group key={`${x}-${z}`} position={[x, 0.42, z]}>
          <mesh rotation={[0, 0, -0.5]} castShadow>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial color={cor} />
          </mesh>
          <mesh rotation={[0, 0, 0.5]} castShadow>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial color="#78aa4d" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Composteira() {
  return (
    <group position={[-5.2, 0, 1.8]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.5, 1.4, 1.25]} />
        <meshStandardMaterial color="#7c5a37" />
      </mesh>
      <Text position={[0, 1.65, 0.66]} fontSize={0.2} color="#243324" anchorX="center">
        COMPOSTAGEM
      </Text>
    </group>
  );
}

function CaixaDAgua() {
  return (
    <group position={[5.5, 0, -2.8]}>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 1.4, 20]} />
        <meshStandardMaterial color="#4e91b8" />
      </mesh>
      {[[-0.55, 0.75], [0.55, 0.75]].map(([x, y]) => (
        <mesh key={x} position={[x, y, 0]} castShadow>
          <boxGeometry args={[0.12, 1.5, 0.12]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      <Text position={[0, 2.65, 0]} fontSize={0.2} color="#24445a" anchorX="center">
        USO CONSCIENTE DA ÁGUA
      </Text>
    </group>
  );
}

function PlacaEcoFazenda() {
  return (
    <group position={[0, 0, -4.9]}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[4.7, 1.15, 0.15]} />
        <meshStandardMaterial color="#ead6a2" />
      </mesh>
      <mesh position={[-1.8, 0.65, 0]} castShadow>
        <boxGeometry args={[0.12, 1.3, 0.12]} />
        <meshStandardMaterial color="#76502f" />
      </mesh>
      <mesh position={[1.8, 0.65, 0]} castShadow>
        <boxGeometry args={[0.12, 1.3, 0.12]} />
        <meshStandardMaterial color="#76502f" />
      </mesh>
      <Text position={[0, 1.52, 0.09]} fontSize={0.31} color="#285a36" anchorX="center">
        HORTA DA ECOFAZENDA
      </Text>
      <Text position={[0, 1.18, 0.09]} fontSize={0.16} color="#3f5b45" anchorX="center">
        Sustentabilidade • conhecimento • futuro
      </Text>
    </group>
  );
}

function Cena({ falando, diagnosticoVR }) {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[6, 12, 5]} intensity={2.1} castShadow />
      <Sky sunPosition={[100, 28, 100]} turbidity={5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#86b963" />
      </mesh>

      <mesh position={[0, 0.012, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 13]} />
        <meshStandardMaterial color="#c7ad7a" />
      </mesh>

      <Canteiro position={[-3.3, 0, 2.7]} cor="#4e923f" />
      <Canteiro position={[3.3, 0, 2.7]} cor="#5f9e45" />
      <Canteiro position={[-3.3, 0, 5.1]} cor="#739e3f" />
      <Canteiro position={[3.3, 0, 5.1]} cor="#4f8842" />

      <Composteira />
      <CaixaDAgua />
      <Cerca />
      <PlacaEcoFazenda />

      <Arvore position={[-7, 0, -3.5]} scale={1.1} />
      <Arvore position={[7, 0, -3.8]} scale={1.15} />
      <Arvore position={[-7.2, 0, 5.8]} scale={0.9} />
      <Arvore position={[7.2, 0, 5.5]} scale={0.95} />

      {/* Ana em escala próxima à humana: personagem original mede ~3,9 unidades. */}
      <group position={[0, 0, -3.0]} scale={0.46}>
        <Ana falando={falando} />
      </group>

      <Text position={[0, 2.18, -3.0]} fontSize={0.25} color="#233a29" anchorX="center">
        {falando ? "Ana está falando..." : "Ana • EcoFazenda Virtual"}
      </Text>

      <group position={[0, 1.65, -1.55]}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.8, 0.48]} />
          <meshBasicMaterial color="#10251a" transparent opacity={0.82} />
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.12} color="white" anchorX="center" anchorY="middle" maxWidth={2.5} textAlign="center">
          {`VR: ${diagnosticoVR || "aguardando..."}`}
        </Text>
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4.5}
        maxDistance={15}
        minPolarAngle={0.75}
        maxPolarAngle={1.45}
        target={[0, 1.35, 0]}
      />
    </>
  );
}

export default function Fazenda3D({ falando, iniciarConversa, iniciarConversaVR, diagnosticoVR }) {
  const iniciouNoVR = useRef(false);

  async function entrarVR() {
    try {
      // No Quest, a síntese de voz precisa nascer do gesto do usuário.
      // Iniciamos a conversa no próprio clique e, em seguida, abrimos a sessão XR.
      if (!iniciouNoVR.current) {
        iniciouNoVR.current = true;
        await (iniciarConversaVR?.() || iniciarConversa?.());
      }

      await xrStore.enterVR();
      console.log("✅ Entrou no VR");
    } catch (erro) {
      iniciouNoVR.current = false;
      console.error("Erro ao entrar em VR:", erro);
      alert("Não foi possível entrar em VR: " + (erro?.message || "erro desconhecido"));
    }
  }

  function sairVR() {
    try {
      const session = xrStore.getState().session;
      if (session) session.end();
      iniciouNoVR.current = false;
    } catch (erro) {
      console.error("Erro ao sair do VR:", erro);
    }
  }

  return (
    <div className="canvas-wrap">
      <div className="vr-actions">
        <button onClick={entrarVR}>🥽 Entrar em VR</button>
        <button onClick={sairVR} className="secondary">Sair do VR</button>
      </div>

      <Canvas shadows camera={{ position: [7.5, 4.8, 9.5], fov: 48 }} dpr={[1, 1.5]}>
        <XR store={xrStore}>
          <Suspense fallback={null}>
            <Cena falando={falando} diagnosticoVR={diagnosticoVR} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
