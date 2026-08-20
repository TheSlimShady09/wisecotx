import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import { getRoofTexture } from "./textures.js";
import { ROOF_LAYERS } from "../lib/roofLayers.js";

/* ============================================================
   The roofing system, exploded — modelled after the classic
   "total protection" cutaway: a pitched slope with the layers
   stepped back so every course shows its edge at the eave
   (decking → ice & water → underlayment → starter → shingles →
   hip & ridge), the timber rafters exposed underneath, and the
   intake / exhaust ventilation. Grayscale, generated, labelled.
   Drag to orbit.
   ============================================================ */

const W = 3.0; // span across the eave (X)
const EAVE = 2.15; // eave edge at +Z
const RIDGE = 2.0; // ridge edge at -Z
const STEP = 0.64; // how far each layer is stepped back up-slope
const NGAP = 0.46; // gap between layers along the slope normal
const TILT = -0.5; // the whole slope tips toward the camera
const damp = THREE.MathUtils.damp;

const LAYERS = ROOF_LAYERS;

function useDisposable(factory, deps) {
  const value = useMemo(factory, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => value.dispose?.(), [value]);
  return value;
}

function Layer({ layer, edgeMaterial, progress, selected, dimmed, onSelect }) {
  const ref = useRef();
  const matRef = useRef();
  const [hovered, setHovered] = useState(false);

  // full-cascade dimensions: each layer's eave is stepped back up-slope
  const zEave = layer.ridgeOnly ? -RIDGE + 0.55 : EAVE - layer.i * STEP;
  const zRidge = -RIDGE;
  const length = zEave - zRidge;
  const centerZ = (zEave + zRidge) / 2;
  const targetY = layer.i * NGAP;

  const geo = useDisposable(() => new THREE.BoxGeometry(W, layer.t, length), [length, layer.t]);
  const edges = useDisposable(() => new THREE.EdgesGeometry(geo, 20), [geo]);
  const texture = layer.tex ? getRoofTexture(layer.tex) : null;
  const grey = useMemo(() => new THREE.Color(layer.color, layer.color, layer.color), [layer.color]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const p = progress.current;
    const float = Math.sin(performance.now() * 0.0005 + layer.i * 0.8) * 0.02 * p;
    // slide out from the assembled stack (all at the deck) into the cascade
    const lift = selected ? 0.24 : hovered ? 0.1 : 0;
    ref.current.position.z = centerZ * p + ((EAVE - RIDGE) / 2) * (1 - p);
    ref.current.position.y = damp(ref.current.position.y, targetY * p + float + lift, 8, Math.min(dt, 0.05));
    // brighten the picked layer, fade the rest
    if (matRef.current) {
      const target = selected || hovered ? 0.4 : 0;
      matRef.current.emissiveIntensity = damp(matRef.current.emissiveIntensity, target, 8, Math.min(dt, 0.05));
      matRef.current.opacity = damp(matRef.current.opacity, dimmed ? 0.32 : 1, 8, Math.min(dt, 0.05));
    }
  });

  return (
    <group ref={ref} position={[0, 0, centerZ]}>
      <mesh
        geometry={geo}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(selected ? null : layer.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <meshStandardMaterial
          ref={matRef}
          map={texture || undefined}
          color={grey}
          roughness={layer.rough}
          metalness={layer.metal ?? 0}
          emissive="#8a8a92"
          emissiveIntensity={0}
          transparent
          flatShading
        />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={3} />
    </group>
  );
}

function Rafter({ x, edgeMaterial }) {
  const len = EAVE + RIDGE;
  const geo = useDisposable(() => new THREE.BoxGeometry(0.09, 0.16, len), [len]);
  const edges = useDisposable(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group position={[x, -0.13, (EAVE - RIDGE) / 2]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#3b3934" roughness={1} flatShading />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={3} />
    </group>
  );
}

function Plate({ z, edgeMaterial }) {
  const geo = useDisposable(() => new THREE.BoxGeometry(W + 0.1, 0.14, 0.16), []);
  const edges = useDisposable(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group position={[0, -0.13, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#332f2b" roughness={1} flatShading />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={3} />
    </group>
  );
}

function Vent({ z, y, side, edgeMaterial, progress }) {
  const ref = useRef();
  const geo = useDisposable(() => new THREE.BoxGeometry(0.85, 0.09, 0.26), []);
  const edges = useDisposable(() => new THREE.EdgesGeometry(geo), [geo]);
  useFrame(() => {
    if (ref.current) ref.current.position.y = y * progress.current;
  });
  return (
    <group ref={ref} position={[W * 0.24 * side, y, z]}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#70707a" roughness={0.5} metalness={0.5} flatShading />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={3} />
    </group>
  );
}

function Assembly({ reducedMotion, selectedId, onSelect }) {
  const progress = useRef(reducedMotion ? 1 : 0);
  const edgeMaterial = useDisposable(
    () => new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.5 }),
    [],
  );

  useFrame((_, dt) => {
    progress.current = damp(progress.current, 1, 2.2, Math.min(dt, 0.05));
  });

  const topY = LAYERS.length * NGAP;

  return (
    <group rotation={[TILT, 0, 0]}>
      {/* timber frame */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <Rafter key={x} x={x} edgeMaterial={edgeMaterial} />
      ))}
      <Plate z={EAVE - 0.05} edgeMaterial={edgeMaterial} />
      <Plate z={-RIDGE + 0.05} edgeMaterial={edgeMaterial} />

      {/* the cascaded covering layers */}
      {LAYERS.map((layer) => (
        <Layer
          key={layer.id}
          layer={layer}
          edgeMaterial={edgeMaterial}
          progress={progress}
          selected={selectedId === layer.id}
          dimmed={selectedId != null && selectedId !== layer.id}
          onSelect={onSelect}
        />
      ))}

      {/* ventilation */}
      <Vent label="Exhaust vent" z={-RIDGE + 0.35} y={topY + 0.15} side={1} edgeMaterial={edgeMaterial} progress={progress} />
      <Vent label="Intake vent" z={EAVE - 0.2} y={0.02} side={-1} edgeMaterial={edgeMaterial} progress={progress} />
    </group>
  );
}

export default function RoofSystemScene({
  reducedMotion = false,
  lowPower = false,
  frameloop = "always",
  selectedId = null,
  onSelect = () => {},
}) {
  return (
    <Canvas
      className="canvas-host"
      shadows={!lowPower}
      frameloop={frameloop}
      dpr={lowPower ? [1, 1.3] : [1, 1.75]}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
      onPointerMissed={() => onSelect(null)}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerspectiveCamera
        makeDefault
        fov={lowPower ? 36 : 32}
        position={lowPower ? [7.4, 6.6, 10.4] : [6.8, 6.0, 9.2]}
        near={0.1}
        far={60}
      />

      <ambientLight intensity={0.42} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={2.1}
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0012}
      />
      <directionalLight position={[-6, 4, -5]} intensity={0.9} color="#ffffff" />

      <Assembly reducedMotion={reducedMotion} selectedId={selectedId} onSelect={onSelect} />

      <ContactShadows position={[0, -1.35, 0]} opacity={0.42} scale={10} blur={2.8} far={6} resolution={lowPower ? 256 : 512} color="#000000" />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        target={[0, 1.35, 0]}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.5}
        rotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
