import { Component, Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import House from "./House.jsx";

const GROUND_Y = -0.55;

/* Two framings. The standard one is set a touch high so tall props — the
   scaffold, the hovering magnifier — sit inside the frame. The "tall" one
   pulls back and lifts the look point for the two-storey complex build. */
const FRAMES = {
  standard: { position: [6.0, 3.25, 7.3], look: [0, 0.7, 0], fov: 36, target: [0, 0.5, 0] },
  // pulled back and lifted for the big multi-wing, four-roof build
  tall: { position: [8.8, 5.0, 10.6], look: [0, 1.7, 0], fov: 34, target: [0, 1.6, 0] },
};

/* The environment preset is the one thing in this scene that fetches
   from the network (drei's CDN). If that fetch fails — offline, CDN
   down — this swallows it and renders nothing rather than taking the
   whole canvas down with it. */
class EnvironmentBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* Without OrbitControls a drei camera keeps its default orientation and
   stares down -Z, leaving the house off to one side. On the still stages
   (the gate, the landing sections) we aim it at the house ourselves. */
function CameraRig({ interactive, frame }) {
  const ref = useRef();

  useEffect(() => {
    if (!interactive && ref.current) ref.current.lookAt(...frame.look);
  }, [interactive, frame]);

  return <PerspectiveCamera ref={ref} makeDefault fov={frame.fov} position={frame.position} near={0.1} far={60} />;
}

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
  lowPower = false,
  complex = false,
  environment = false,
  ...house
}) {
  const frame = complex ? FRAMES.tall : FRAMES.standard;
  return (
    <Canvas
      className="canvas-host"
      shadows={!lowPower}
      frameloop={frameloop}
      // phones cap the pixel ratio and drop real-time shadow maps; the
      // contact shadow below carries the grounding either way
      dpr={lowPower ? [1, 1.3] : [1, 1.75]}
      gl={{
        antialias: !lowPower,
        alpha: true,
        powerPreference: lowPower ? "low-power" : "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <CameraRig interactive={interactive} frame={frame} />

      {/* key */}
      <directionalLight
        position={[6, 8, 5]}
        intensity={2.2}
        castShadow={!lowPower}
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
        {/* reflections/ambient response for materials to react to — skipped
            on phone so nothing extra is fetched or baked there */}
        {environment && !lowPower ? (
          <EnvironmentBoundary>
            <Environment preset="city" resolution={256} />
          </EnvironmentBoundary>
        ) : null}
        <House {...house} complex={complex} reducedMotion={reducedMotion} />
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
        resolution={lowPower ? 256 : 512}
        color="#000000"
      />

      {interactive ? (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          target={frame.target}
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
