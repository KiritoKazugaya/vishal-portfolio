"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { LAYERS, PHASES } from "@/lib/chip-config"
import { chipState, damp, range, smooth } from "@/lib/scroll-store"

/**
 * Interconnects between the separated layers.
 *
 * These are conductors, not particles: each one is a transparent routed trace
 * (down, across, down — the way a via actually steps between board layers) and
 * the current is a bright band travelling *inside* it, driven by a shader on
 * the tube's length UV. Showing discrete spheres read as "balls moving through
 * space"; a lit conductor reads as power.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uDir;
  uniform float uActive;
  uniform float uOpened;
  uniform vec3  uColor;
  varying vec2 vUv;

  void main() {
    // TubeGeometry lays uv.x along the path, so this is distance travelled.
    float p = vUv.x;

    // Three charges in flight per conductor, direction follows the scroll.
    float t = fract(p * 3.0 - uTime * uDir);
    float pulse = pow(1.0 - t, 9.0);

    // The conductor itself stays faintly visible so the routing reads as
    // structure even when no charge is passing through it.
    float rest = 0.16 + uActive * 0.22;

    // Taper both ends so the trace melts into the slab instead of clipping.
    float ends = smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.95, 1.0, p));

    float intensity = (rest + pulse * (0.8 + uActive * 1.9)) * ends * uOpened;
    vec3  colour    = uColor * (0.45 + pulse * 2.4);

    gl_FragColor = vec4(colour, intensity);
  }
`

/** Perimeter positions, as a fraction of the narrower layer's half-width. */
const ROUTES: Array<[number, number]> = [
  [-0.82, -0.82],
  [0.82, -0.82],
  [-0.82, 0.82],
  [0.82, 0.82],
  [0, -0.9],
  [0, 0.9],
]

/**
 * A stepped via path: straight down out of the upper slab, a lateral jog, then
 * straight down into the lower one. Curve resolution is low on purpose — the
 * corners should read as machined right angles, not as a hose.
 */
function routeCurve(x: number, z: number, top: number, bottom: number) {
  const mid = (top + bottom) / 2
  const jog = Math.sign(x || z || 1) * 0.16
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(x, top, z),
      new THREE.Vector3(x, mid + (top - mid) * 0.35, z),
      new THREE.Vector3(x + jog, mid, z + jog * 0.5),
      new THREE.Vector3(x, mid + (bottom - mid) * 0.35, z),
      new THREE.Vector3(x, bottom, z),
    ],
    false,
    "catmullrom",
    0.05,
  )
}

export function CurrentFlow({ density = 6 }: { density?: number }) {
  const group = useRef<THREE.Group>(null)
  const time = useRef(0)
  const dir = useRef(1)

  const routes = useMemo(() => ROUTES.slice(0, Math.max(2, density)), [density])

  /** One material per gap so colour and focus can differ down the stack. */
  const materials = useMemo(
    () =>
      LAYERS.slice(0, -1).map(
        (_, gap) =>
          new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uTime: { value: 0 },
              uDir: { value: 1 },
              uActive: { value: 0 },
              uOpened: { value: 0 },
              uColor: { value: new THREE.Color(LAYERS[gap + 1].accent) },
            },
          }),
      ),
    [],
  )

  const geometries = useMemo(() => {
    const out: Array<{ gap: number; geom: THREE.TubeGeometry }> = []
    for (let gap = 0; gap < LAYERS.length - 1; gap++) {
      const half = Math.min(LAYERS[gap].size, LAYERS[gap + 1].size) / 2
      const top = LAYERS[gap].separatedY - LAYERS[gap].thickness / 2
      const bottom = LAYERS[gap + 1].separatedY + LAYERS[gap + 1].thickness / 2
      for (const [ox, oz] of routes) {
        const curve = routeCurve(ox * half, oz * half, top, bottom)
        out.push({ gap, geom: new THREE.TubeGeometry(curve, 28, 0.022, 6, false) })
      }
    }
    return out
  }, [routes])

  /** Contact pads where each conductor meets a slab. */
  const pads = useMemo(() => {
    const out: Array<{ gap: number; pos: [number, number, number] }> = []
    for (let gap = 0; gap < LAYERS.length - 1; gap++) {
      const half = Math.min(LAYERS[gap].size, LAYERS[gap + 1].size) / 2
      const top = LAYERS[gap].separatedY - LAYERS[gap].thickness / 2
      const bottom = LAYERS[gap + 1].separatedY + LAYERS[gap + 1].thickness / 2
      for (const [ox, oz] of routes) {
        out.push({ gap, pos: [ox * half, top, oz * half] })
        out.push({ gap, pos: [ox * half, bottom, oz * half] })
      }
    }
    return out
  }, [routes])

  useEffect(
    () => () => {
      geometries.forEach((g) => g.geom.dispose())
      materials.forEach((m) => m.dispose())
    },
    [geometries, materials],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const opened = smooth(range(chipState.hero, PHASES.separate[0], PHASES.separate[1]))

    if (group.current) group.current.visible = opened > 0.01

    if (chipState.paused || opened <= 0.01) return

    dir.current = damp(dir.current, chipState.direction, 4, dt)
    time.current += dt * 0.5

    materials.forEach((mat, gap) => {
      const near = Math.max(
        chipState.focus[LAYERS[gap].id] ?? 0,
        chipState.focus[LAYERS[gap + 1].id] ?? 0,
      )
      mat.uniforms.uTime.value = time.current
      mat.uniforms.uDir.value = dir.current
      mat.uniforms.uOpened.value = opened
      mat.uniforms.uActive.value = damp(mat.uniforms.uActive.value, near, 5, dt)
    })
  })

  return (
    <group ref={group}>
      {geometries.map(({ gap, geom }, i) => (
        <mesh key={`trace-${i}`} geometry={geom} material={materials[gap]} frustumCulled={false} />
      ))}

      {pads.map(({ gap, pos }, i) => (
        <mesh key={`pad-${i}`} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.028, 0.055, 12]} />
          <meshBasicMaterial
            color={LAYERS[gap + 1].accent}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
