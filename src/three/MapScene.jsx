import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Grid, Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import { COMPANY } from "../lib/site.js";

/* A stylised 3D map of the service area, in the same dark blueprint idiom
   as the rest of the site — extruded city blocks in grayscale with white
   pen-line edges, a marker at WCG's location, and coverage rings. No map
   API, no colour: it is generated, like the houses. */

// [x, z, width, depth, height] — a rough downtown cluster with an open
// centre where the marker stands.
const BLOCKS = [
  [-2.2, -1.6, 0.7, 0.7, 1.1],
  [-1.35, -2.15, 0.6, 0.9, 0.7],
  [1.6, -1.8, 0.8, 0.6, 1.5],
  [2.35, -0.9, 0.6, 0.6, 0.95],
  [1.2, 1.7, 0.9, 0.7, 1.25],
  [2.1, 1.95, 0.6, 0.6, 0.8],
  [-1.9, 1.4, 0.7, 0.8, 1.05],
  [-2.5, 0.5, 0.6, 0.7, 1.55],
  [-0.9, 1.95, 0.6, 0.6, 0.6],
  [0.8, -2.2, 0.7, 0.6, 0.9],
  [-1.5, -0.9, 0.5, 0.5, 0.6],
  [1.45, -0.6, 0.5, 0.5, 0.7],
  [1.0, 0.9, 0.5, 0.5, 0.5],
  [-1.1, 0.85, 0.5, 0.5, 0.55],
  [0.25, -1.5, 0.5, 0.5, 0.85],
  [-0.35, 1.3, 0.5, 0.5, 0.6],
  [2.7, -2.2, 0.7, 0.7, 1.0],
  [-2.75, -2.05, 0.6, 0.6, 0.85],
];

function Block({ x, z, w, d, h, edgeMaterial }) {
  const geo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  useEffect(
    () => () => {
      geo.dispose();
      edges.dispose();
    },
    [geo, edges],
  );

  return (
    <group position={[x, h / 2, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#26262a" roughness={0.92} metalness={0} flatShading />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={3} />
    </group>
  );
}

/* Concentric coverage rings, the outer one breathing outward. */
function Coverage() {
  const pulseRef = useRef();
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    if (!pulseRef.current) return;
    const p = (t.current % 4) / 4;
    pulseRef.current.scale.setScalar(1 + p * 1.6);
    pulseRef.current.material.opacity = (1 - p) * 0.35;
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
      <mesh>
        <ringGeometry args={[2.0, 2.03, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[3.3, 3.33, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={pulseRef}>
        <ringGeometry args={[1.2, 1.24, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* The location marker — a pin standing at WCG's spot, with a pulse on
   the ground and a floating label. */
function Marker() {
  const ringRef = useRef();
  const headRef = useRef();
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    if (ringRef.current) {
      const p = (t.current % 2.4) / 2.4;
      ringRef.current.scale.setScalar(1 + p * 2.2);
      ringRef.current.material.opacity = (1 - p) * 0.6;
    }
    if (headRef.current) {
      headRef.current.position.y = 1.95 + Math.sin(t.current * 1.6) * 0.06;
    }
  });

  return (
    <group>
      {/* stem */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.7, 10]} />
        <meshStandardMaterial color="#f2f1ee" roughness={0.5} metalness={0.2} flatShading />
      </mesh>
      {/* head */}
      <mesh ref={headRef} position={[0, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* ground pulse */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.18, 0.22, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.05, 20]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <Html center distanceFactor={9} position={[0, 2.4, 0]} zIndexRange={[20, 0]} pointerEvents="none">
        <span className="map-pin">
          <strong>{COMPANY.short}</strong>
          {COMPANY.address.city}
        </span>
      </Html>
    </group>
  );
}

function City({ rotate }) {
  const group = useRef();

  useFrame((_, dt) => {
    if (rotate && group.current) group.current.rotation.y += dt * 0.12;
  });

  const edgeMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.22 }),
    [],
  );
  useEffect(() => () => edgeMaterial.dispose(), [edgeMaterial]);

  return (
    <group ref={group}>
      {BLOCKS.map((b, i) => (
        <Block key={i} x={b[0]} z={b[1]} w={b[2]} d={b[3]} h={b[4]} edgeMaterial={edgeMaterial} />
      ))}
      <Coverage />
      <Marker />
    </group>
  );
}

export default function MapScene({ reducedMotion = false, lowPower = false, frameloop = "always" }) {
  return (
    <Canvas
      className="canvas-host"
      shadows={!lowPower}
      frameloop={frameloop}
      dpr={lowPower ? [1, 1.3] : [1, 1.75]}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerspectiveCamera makeDefault fov={32} position={[4.5, 6.2, 7.2]} near={0.1} far={60} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.9}
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0012}
      />
      <directionalLight position={[-6, 4, -5]} intensity={1.3} color="#ffffff" />

      <City rotate={!reducedMotion} />

      <Grid
        position={[0, 0.002, 0]}
        args={[26, 26]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#33333a"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#5a5a62"
        fadeDistance={26}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={16} blur={2.6} far={6} resolution={lowPower ? 256 : 512} color="#000000" />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        target={[0, 0.4, 0]}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.46}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
