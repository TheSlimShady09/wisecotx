import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import House from "./House.jsx";

const GROUND_Y = -0.55;

/* ============================================================
   The lazy-loaded 3D chunk. Nothing here is imported by the
   initial bundle — CanvasStage pulls it in only when the stage
   scrolls into view on a WebGL-capable device.
   ============================================================ */
export default function Scene({
  interactive = false,
  reducedMotion = false,
  frameloop = "always",
  showGround = true,
  ...house
}) {
  return (
    <Canvas
      className="canvas-host"
      shadows
      frameloop={frameloop}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerspectiveCamera makeDefault fov={34} position={[5.4, 2.9, 6.6]} near={0.1} far={60} />

      {/* key */}
      <directionalLight
        position={[6, 8, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0012}
      />
      {/* fill, kept low so the flat shading keeps its facets */}
      <directionalLight position={[-7, 4, -3]} intensity={0.42} />
      <ambientLight intensity={0.32} />

      {/* rim — this is what lifts a dark house off a dark page.
          Two rakes from behind catch the roof ridge and the wall
          corners, so the silhouette reads without lifting the
          base tone. */}
      <directionalLight position={[-5, 3.5, -7]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[5.5, 2, -6.5]} intensity={0.9} color="#ffffff" />

      <Suspense fallback={null}>
        <House {...house} reducedMotion={reducedMotion} />
      </Suspense>

      {/* the drawing sheet the house stands on. Outside the house
          group: the model rotates and drifts, the ground does not. */}
      {showGround ? (
        <Grid
          position={[0, GROUND_Y + 0.002, 0]}
          args={[24, 24]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#3a3a40"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#6a6a72"
          fadeDistance={22}
          fadeStrength={1.4}
          followCamera={false}
          infiniteGrid
        />
      ) : null}

      <ContactShadows
        position={[0, GROUND_Y, 0]}
        opacity={0.55}
        scale={12}
        blur={2.8}
        far={4.5}
        resolution={512}
        color="#000000"
      />

      {interactive ? (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          target={[0, 0.35, 0]}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.49}
          rotateSpeed={0.6}
          enableDamping
          dampingFactor={0.08}
        />
      ) : null}
    </Canvas>
  );
}
