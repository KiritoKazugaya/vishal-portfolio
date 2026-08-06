"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Environment, Lightformer } from "@react-three/drei"
import * as THREE from "three"

import { LAYERS } from "@/lib/chip-config"
import { chipState, damp, lerp, smooth } from "@/lib/scroll-store"
import { ChipLayer } from "./chip-layer"
import { CurrentFlow } from "./current-flow"

/**
 * Camera keyframes across the pinned hero act.
 *
 * The whole opening is one continuous camera move: directly overhead (which
 * reads as the flat, face-on hero plate), swinging down into a three-quarter
 * view, then pulling back as the stack separates. Because it is one move, the
 * "rotation" never has to cross-fade between two incompatible renders.
 */
const KEYS = [
  { t: 0.0, pos: [0, 12.6, 0.02], look: [0, 0, 0] },
  { t: 0.2, pos: [0, 11.0, 2.4], look: [0, 0, 0] },
  { t: 0.46, pos: [0, 5.6, 8.6], look: [0, 0, 0] },
  { t: 0.82, pos: [0, 1.8, 13.4], look: [0, -0.4, 0] },
  { t: 1.0, pos: [0, 1.0, 14.2], look: [0, -0.6, 0] },
] as const

function sampleCamera(p: number, out: { pos: THREE.Vector3; look: THREE.Vector3 }) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const span = b.t - a.t
  const local = span <= 0 ? 0 : smooth(Math.min(1, Math.max(0, (p - a.t) / span)))
  out.pos.set(
    lerp(a.pos[0], b.pos[0], local),
    lerp(a.pos[1], b.pos[1], local),
    lerp(a.pos[2], b.pos[2], local),
  )
  out.look.set(
    lerp(a.look[0], b.look[0], local),
    lerp(a.look[1], b.look[1], local),
    lerp(a.look[2], b.look[2], local),
  )
}

function CameraRig({ wide }: { wide: boolean }) {
  const { camera } = useThree()
  const sample = useMemo(
    () => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }),
    [],
  )
  const look = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    sampleCamera(chipState.hero, sample)

    // Once the hero act has resolved, the camera tracks down the stack as the
    // reader moves through the chapters.
    if (chipState.hero > 0.98) {
      const activeY = LAYERS[chipState.active]?.separatedY ?? 0
      sample.look.y += activeY * 0.55
      sample.pos.y += activeY * 0.42
      // Push the stack off-centre on wide screens so copy has its own column.
      if (wide) {
        sample.pos.x += 2.5
        sample.look.x += 2.5
      }
    }

    if (!chipState.reduced) {
      sample.pos.x += chipState.pointerX * 0.55
      sample.pos.y += chipState.pointerY * 0.35
    }

    const lambda = chipState.reduced ? 30 : 6
    camera.position.x = damp(camera.position.x, sample.pos.x, lambda, dt)
    camera.position.y = damp(camera.position.y, sample.pos.y, lambda, dt)
    camera.position.z = damp(camera.position.z, sample.pos.z, lambda, dt)

    look.current.x = damp(look.current.x, sample.look.x, lambda, dt)
    look.current.y = damp(look.current.y, sample.look.y, lambda, dt)
    look.current.z = damp(look.current.z, sample.look.z, lambda, dt)
    camera.lookAt(look.current)
  })

  return null
}

/** A soft accent light that follows whichever layer is being read. */
function FocusLight() {
  const light = useRef<THREE.PointLight>(null)
  const target = useMemo(() => new THREE.Color(), [])
  const accents = useMemo(() => LAYERS.map((l) => new THREE.Color(l.accent)), [])

  useFrame((_, delta) => {
    const l = light.current
    if (!l) return
    const dt = Math.min(delta, 1 / 30)
    const active = LAYERS[chipState.active]
    l.position.y = damp(l.position.y, (active?.separatedY ?? 0) + 0.9, 5, dt)
    target.copy(accents[chipState.active] ?? accents[0])
    l.color.lerp(target, 1 - Math.exp(-5 * dt))
    l.intensity = damp(l.intensity, chipState.hero > 0.5 ? 14 : 4, 4, dt)
  })

  return <pointLight ref={light} position={[2.4, 2, 3.2]} intensity={4} distance={22} decay={1.6} />
}

export function ChipScene({ density }: { density: number }) {
  const { size } = useThree()
  const wide = size.width >= 1024

  return (
    <>
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 14, 30]} />

      <CameraRig wide={wide} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 12, 6]} intensity={1.5} color="#dbeafe" />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#7dd3fc" />
      <FocusLight />

      {/* Baked once into a cube target — gives the metal something to reflect
          without fetching an HDR from a CDN. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 7, 5]} scale={[12, 12, 1]} color="#e8f0ff" />
        <Lightformer form="rect" intensity={1.3} position={[-7, 2, 3]} scale={[7, 7, 1]} color="#7dd3fc" />
        <Lightformer form="rect" intensity={1.1} position={[7, 1, -3]} scale={[7, 7, 1]} color="#f0b429" />
        <Lightformer form="rect" intensity={0.8} position={[0, -6, 2]} scale={[10, 6, 1]} color="#334155" />
      </Environment>

      <group>
        {LAYERS.map((def, i) => (
          <ChipLayer key={def.id} def={def} index={i} total={LAYERS.length} />
        ))}
        <CurrentFlow density={density} />
      </group>
    </>
  )
}
