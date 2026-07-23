import { DAMAGE, MODULE_PREVIEW, PERILS } from "./site.js";

/**
 * Resolves a module's characterizing 3D scene into the exact props
 * CanvasStage/House expect. One source of truth so the entry gate and
 * the landing sections always show the same house for a given module.
 */
export function stagePropsForModule(id) {
  const scene = MODULE_PREVIEW[id]?.scene;
  if (!scene) return {};

  let hotspots = [];
  let markerLabel = null;
  if (scene.hotspotsFrom) {
    const { set, id: itemId } = scene.hotspotsFrom;
    const source = set === "perils" ? PERILS : DAMAGE;
    const item = source.find((entry) => entry.id === itemId);
    hotspots = item?.hotspots ?? [];
    markerLabel = item?.code ?? null;
  }

  return {
    pitch: scene.pitch,
    hipInset: scene.hipInset,
    textureKind: scene.textureKind,
    roughness: scene.roughness,
    metalness: scene.metalness,
    tone: scene.tone,
    spin: scene.spin ?? 0.1,
    targetAngle: scene.targetAngle ?? null,
    prop: scene.prop ?? null,
    modelScale: scene.modelScale ?? 1,
    complex: scene.complex ?? false,
    hotspots,
    markerLabel,
  };
}
