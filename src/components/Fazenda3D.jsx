import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Text } from "@react-three/drei";
import { Suspense, useRef } from "react";
import Ana from "./Ana";
import { XR, createXRStore } from "@react-three/xr";

const xrStore = createXRStore();

const madeira = "#6f482e";
const madeiraClara = "#8a5c38";
const terra = "#4b2f20";
const terraSeca = "#6a4329";
const verdeFolha = "#3e7b39";
const verdeClaro = "#69a84b";

function Tronco({ position = [0, 0, 0], scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <cylinderGeometry args={[0.17, 0.25, 2.15, 10]} />
      <meshStandardMaterial color="#6d472e" roughness={0.96} />
    </mesh>
  );
}

function Arvore({ position = [0, 0, 0], scale = 1 }) {
  const copas = [
    [0, 2.2, 0, 0.9],
    [-0.48, 2.15, 0.08, 0.62],
    [0.48, 2.18, 0.02, 0.68],
    [0.05, 2.72, -0.05, 0.62],
    [-0.18, 2.43, 0.42, 0.58],
  ];

  return (
    <group position={position} scale={scale}>
      <Tronco position={[0, 1.02, 0]} />
      <mesh position={[-0.22, 1.68, 0]} rotation={[0, 0, -0.55]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.0, 8]} />
        <meshStandardMaterial color="#6d472e" roughness={1} />
      </mesh>
      {copas.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 0.86, s]} castShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#2f7138" : "#438842"}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function Cerca() {
  const postes = [-7, -5.5, -4, -2.5, -1, 0.5, 2, 3.5, 5, 6.5, 7.5];
  return (
    <group position={[0, 0, -6.25]}>
      {postes.map((x, i) => (
        <group key={x}>
          <mesh position={[x, 0.72, 0]} rotation={[0, 0, i % 2 ? 0.015 : -0.012]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 1.45, 0.16]} />
            <meshStandardMaterial color={i % 3 === 0 ? madeiraClara : madeira} roughness={0.95} />
          </mesh>
          <mesh position={[x, 1.49, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.13, 0.22, 4]} />
            <meshStandardMaterial color={madeira} roughness={1} />
          </mesh>
        </group>
      ))}
      {[0.5, 1.0].map((y, i) => (
        <mesh key={y} position={[0.25, y, 0.01]} castShadow receiveShadow>
          <boxGeometry args={[15.3, 0.12, 0.13]} />
          <meshStandardMaterial color={i ? "#835735" : "#754a2f"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Alface({ position, scale = 1, cor = verdeFolha }) {
  const folhas = [
    [0, 0.11, 0, 0.21],
    [0.15, 0.1, 0, 0.18],
    [-0.15, 0.1, 0.02, 0.18],
    [0.02, 0.1, 0.15, 0.17],
    [-0.02, 0.1, -0.15, 0.17],
  ];
  return (
    <group position={position} scale={scale}>
      {folhas.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.58, 1]} castShadow>
          <sphereGeometry args={[s, 8, 7]} />
          <meshStandardMaterial color={i % 2 ? verdeClaro : cor} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Cenoura({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <coneGeometry args={[0.065, 0.28, 8]} />
        <meshStandardMaterial color="#d66c2d" roughness={0.85} />
      </mesh>
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.31, 0]} rotation={[0, 0, x * 5]} castShadow>
          <boxGeometry args={[0.035, 0.28, 0.035]} />
          <meshStandardMaterial color={i === 1 ? "#4f8a3d" : "#5e9d48"} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Tomateiro({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.8, 7]} />
        <meshStandardMaterial color="#476e36" roughness={1} />
      </mesh>
      {[[-0.11, 0.5, 0], [0.11, 0.62, 0.03], [-0.08, 0.72, -0.04]].map((p, i) => (
        <mesh key={i} position={p} scale={[0.15, 0.07, 0.09]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#4c8d3f" roughness={0.9} />
        </mesh>
      ))}
      {[[-0.1, 0.38, 0.05], [0.09, 0.49, -0.05], [0.02, 0.6, 0.06]].map((p, i) => (
        <mesh key={`t-${i}`} position={p} castShadow>
          <sphereGeometry args={[0.055, 8, 7]} />
          <meshStandardMaterial color="#be4934" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function Canteiro({ position, tipo = "alface" }) {
  const pontos = [];
  for (let x = -1.5; x <= 1.5; x += 0.5) {
    for (let z = -0.48; z <= 0.48; z += 0.48) pontos.push([x, z]);
  }

  return (
    <group position={position}>
      {/* estrutura de madeira */}
      <mesh position={[0, 0.18, -0.86]} castShadow receiveShadow>
        <boxGeometry args={[4.15, 0.36, 0.16]} />
        <meshStandardMaterial color={madeira} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.18, 0.86]} castShadow receiveShadow>
        <boxGeometry args={[4.15, 0.36, 0.16]} />
        <meshStandardMaterial color={madeiraClara} roughness={0.96} />
      </mesh>
      <mesh position={[-1.99, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.36, 1.58]} />
        <meshStandardMaterial color={madeira} roughness={0.96} />
      </mesh>
      <mesh position={[1.99, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.36, 1.58]} />
        <meshStandardMaterial color={madeiraClara} roughness={0.96} />
      </mesh>

      {/* terra */}
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[3.82, 0.28, 1.53]} />
        <meshStandardMaterial color={terra} roughness={1} />
      </mesh>
      <mesh position={[0, 0.325, 0]} receiveShadow>
        <boxGeometry args={[3.74, 0.025, 1.45]} />
        <meshStandardMaterial color={terraSeca} roughness={1} />
      </mesh>

      {pontos.map(([x, z], i) => {
        const pos = [x, 0.35, z];
        if (tipo === "cenoura") return <Cenoura key={i} position={pos} />;
        if (tipo === "tomate") return i % 3 === 0 ? <Tomateiro key={i} position={pos} /> : null;
        return <Alface key={i} position={pos} scale={0.9 + (i % 3) * 0.05} />;
      })}
    </group>
  );
}

function Composteira() {
  return (
    <group position={[-5.35, 0, 1.55]}>
      {[0, 0.38, 0.76, 1.14].map((y, i) => (
        <mesh key={i} position={[0, 0.26 + y * 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.55, 0.16, 1.22]} />
          <meshStandardMaterial color={i % 2 ? "#6f482e" : "#805638"} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 1.12, 0]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[1.62, 0.12, 1.28]} />
        <meshStandardMaterial color="#5d3d29" roughness={1} />
      </mesh>
      <Text position={[0, 1.48, 0.65]} fontSize={0.18} color="#263729" anchorX="center">
        COMPOSTAGEM
      </Text>
    </group>
  );
}

function CaixaDAgua() {
  return (
    <group position={[5.6, 0, -3.35]}>
      <mesh position={[0, 1.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.88, 0.88, 1.45, 24]} />
        <meshStandardMaterial color="#3f7897" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow>
        <cylinderGeometry args={[0.89, 0.7, 0.08, 24]} />
        <meshStandardMaterial color="#315f79" roughness={0.55} />
      </mesh>
      {[-0.58, 0.58].map((x) => (
        <mesh key={x} position={[x, 0.88, 0]} castShadow>
          <boxGeometry args={[0.12, 1.78, 0.12]} />
          <meshStandardMaterial color="#4b4b48" roughness={0.8} metalness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[1.45, 0.11, 1.25]} />
        <meshStandardMaterial color="#4b4b48" roughness={0.8} metalness={0.35} />
      </mesh>
      <Text position={[0, 3.02, 0]} fontSize={0.16} color="#24445a" anchorX="center">
        CAPTAÇÃO DE ÁGUA
      </Text>
    </group>
  );
}

function PainelSolar({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.92, 0]} rotation={[-0.48, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.08, 1.05]} />
        <meshStandardMaterial color="#173f54" roughness={0.38} metalness={0.38} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.42, 0.18]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.95, 0.07]} />
          <meshStandardMaterial color="#575b58" roughness={0.75} metalness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function PlacaEcoFazenda() {
  return (
    <group position={[-2.1, 0, -5.55]} rotation={[0, 0.08, 0]}>
      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[4.2, 1.12, 0.13]} />
        <meshStandardMaterial color="#e5d1a0" roughness={0.86} />
      </mesh>
      {[-1.55, 1.55].map((x) => (
        <mesh key={x} position={[x, 0.7, 0]} castShadow>
          <boxGeometry args={[0.13, 1.42, 0.13]} />
          <meshStandardMaterial color="#6d472e" roughness={1} />
        </mesh>
      ))}
      <Text position={[0, 1.58, 0.08]} fontSize={0.27} color="#285a36" anchorX="center">
        HORTA DA ECOFAZENDA
      </Text>
      <Text position={[0, 1.24, 0.08]} fontSize={0.145} color="#3f5b45" anchorX="center">
        Sustentabilidade • conhecimento • futuro
      </Text>
    </group>
  );
}

function Caminho() {
  const pedras = [
    [-0.48, 0.035, 5.8, -0.08], [0.35, 0.035, 4.75, 0.12], [-0.35, 0.035, 3.7, -0.06],
    [0.42, 0.035, 2.65, 0.1], [-0.2, 0.035, 1.6, -0.09], [0.32, 0.035, 0.5, 0.04],
    [-0.3, 0.035, -0.55, -0.08], [0.24, 0.035, -1.58, 0.08], [-0.18, 0.035, -2.45, -0.06],
  ];
  return (
    <group>
      <mesh position={[0, 0.012, 1.65]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.55, 13.8]} />
        <meshStandardMaterial color="#b99a69" roughness={1} />
      </mesh>
      {pedras.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, r]} receiveShadow>
          <circleGeometry args={[0.38 + (i % 2) * 0.06, 8]} />
          <meshStandardMaterial color={i % 2 ? "#9d8f7b" : "#a99b87"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Solo() {
  const manchas = [
    [-6.8, 0.018, 3.8, 2.3, 1.45], [6.9, 0.018, 4.3, 2.6, 1.5], [-6.2, 0.018, -1.2, 1.9, 1.0],
    [6.5, 0.018, 0.5, 2.0, 1.1], [0, 0.018, -6.7, 5.2, 1.1],
  ];
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#729d55" roughness={1} />
      </mesh>
      {manchas.map(([x, y, z, sx, sz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[sx, sz, 1]} receiveShadow>
          <circleGeometry args={[1, 24]} />
          <meshStandardMaterial color={i % 2 ? "#7ba65b" : "#6c944f"} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function Cena({ falando, diagnosticoVR }) {
  return (
    <>
      <color attach="background" args={["#b7d5e7"]} />
      <fog attach="fog" args={["#c9dfe9", 18, 38]} />
      <hemisphereLight intensity={0.85} color="#fff6df" groundColor="#49613b" />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[7, 12, 6]}
        intensity={1.75}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <Sky sunPosition={[100, 26, 80]} turbidity={6} rayleigh={1.2} mieCoefficient={0.006} mieDirectionalG={0.78} />

      <Solo />
      <Caminho />

      <Canteiro position={[-3.5, 0, 2.6]} tipo="alface" />
      <Canteiro position={[3.5, 0, 2.6]} tipo="cenoura" />
      <Canteiro position={[-3.5, 0, 5.2]} tipo="tomate" />
      <Canteiro position={[3.5, 0, 5.2]} tipo="alface" />

      <Composteira />
      <CaixaDAgua />
      <PainelSolar position={[4.15, 0, -4.45]} rotationY={-0.16} />
      <PainelSolar position={[6.05, 0, -4.5]} rotationY={-0.16} />
      <Cerca />
      <PlacaEcoFazenda />

      <Arvore position={[-7.1, 0, -3.7]} scale={1.05} />
      <Arvore position={[7.5, 0, -4.0]} scale={1.08} />
      <Arvore position={[-7.4, 0, 5.8]} scale={0.92} />
      <Arvore position={[7.45, 0, 5.75]} scale={0.96} />

      {/* Ana humana: corpo propositalmente estático para estabilidade no Quest 2. */}
      <group position={[0, 0, -3.05]} rotation={[0, 0.08, 0]}>
        <Ana falando={falando} />
      </group>

      <Text position={[0, 2.2, -3.05]} fontSize={0.22} color="#1f3928" anchorX="center">
        {falando ? "Ana está falando..." : "Ana • EcoFazenda Virtual"}
      </Text>

      <group position={[0, 1.55, -1.5]}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.75, 0.44]} />
          <meshBasicMaterial color="#0e2118" transparent opacity={0.72} />
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.105} color="white" anchorX="center" anchorY="middle" maxWidth={2.42} textAlign="center">
          {`VR: ${diagnosticoVR || "aguardando..."}`}
        </Text>
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4.5}
        maxDistance={15}
        minPolarAngle={0.72}
        maxPolarAngle={1.45}
        target={[0, 1.3, 0.4]}
      />
    </>
  );
}

export default function Fazenda3D({ falando, iniciarConversa, iniciarConversaVR, diagnosticoVR }) {
  const iniciouNoVR = useRef(false);

  async function entrarVR() {
    try {
      // No Quest, a síntese de voz precisa nascer do gesto do usuário.
      // Mantemos este fluxo intacto para não quebrar a versão estável.
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

      <Canvas shadows camera={{ position: [7.6, 4.7, 9.7], fov: 47 }} dpr={[1, 1.45]}>
        <XR store={xrStore}>
          <Suspense fallback={null}>
            <Cena falando={falando} diagnosticoVR={diagnosticoVR} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
