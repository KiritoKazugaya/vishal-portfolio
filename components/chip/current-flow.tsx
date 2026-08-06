"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { LAYERS, PHASES } from "@/lib/chip-config"
import { chipState, damp, lerp, range, smooth } from "@/lib/scroll-store"

/** Corner positions, as a fraction of the narrowest layer's half-width. */
const TRACK_OFFSETS: Array<[number, number]> = [
  [-0.78, -0.78],
  [0.78, -0.78],
  [-0.78, 0.78],
  [0.78, 0.78],
]

interface Track {
  gap: number
  x: number
  z: number
  offset: number
}

/**
 * Power and data moving between the separated layers.
 *
 * Deliberately not lightning: particles run on fixed vertical interconnects at
 * the package corners, and the travel direction follows the scroll direction —
 * scrolling down pushes current toward lower layers, up reverses it.
 */
export function CurrentFlow({ density = 5 }: { density?: number }) {
  const points = useRef<THREE.InstancedMesh>(null)
  const lines = useRef<THREE.LineSegments>(null)
  const phase = useRef(0)
  const dirSmooth = useRef(1)

  const tracks = useMemo<Track[]>(() => {
    const out: Track[] = []
    for (let gap = 0; gap < LAYERS.length - 1; gap++) {
      const half = Math.min(LAYERS[gap].size, LAYERS[gap + 1].size) / 2
      TRACK_OFFSETS.forEach(([ox, oz], corner) => {
        for (let k = 0; k < density; k++) {
          out.push({
            gap,
            x: ox * half,
            z: oz * half,
            offset: (k / density + corner * 0.13) % 1,
          })
        }
      })
    }
    return out
  }, [density])

  const lineGeom = useMemo(() => {
    const pts: number[] = []
    for (let gap = 0; gap < LAYERS.length - 1; gap++) {
      const half = Math.min(LAYERS[gap].size, LAYERS[gap + 1].size) / 2
      const top = LAYERS[gap].separatedY
      const bottom = LAYERS[gap + 1].separatedY
      TRACK_OFFSETS.forEach(([ox, oz]) => {
        pts.push(ox * half, top, oz * half, ox * half, bottom, oz * half)
      })
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])

  useEffect(() => () => lineGeom.dispose(), [lineGeom])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colour = useMemo(() => new THREE.Color(), [])
  const accents = useMemo(() => LAYERS.map((l) => new THREE.Color(l.accent)), [])

  useFrame((_, delta) => {
    const mesh = points.current
    if (!mesh) return
    const dt = Math.min(delta, 1 / 30)

    // Current only exists once the stack has opened up.
    const opened = smooth(range(chipState.hero, PHASES.separate[0], PHASES.separate[1]))

    if (lines.current) {
      const mat = lines.current.material as THREE.LineBasicMaterial
      mat.opacity = damp(mat.opacity, opened * 0.22, 5, dt)
    }

    if (chipState.paused || opened < 0.01) {
      mesh.visible = false
      return
    }
    mesh.visible = true

    dirSmooth.current = damp(dirSmooth.current, chipState.direction, 4, dt)
    phase.current += dt * 0.34

    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i]
      const top = LAYERS[t.gap].separatedY
      const bottom = LAYERS[t.gap + 1].separatedY

      let u = (phase.current + t.offset) % 1
      if (dirSmooth.current < 0) u = 1 - u

      const y = lerp(top, bottom, u)

      // Brightest at the gap adjoining the chapter being read.
      const near = Math.max(
        chipState.focus[LAYERS[t.gap].id] ?? 0,
        chipState.focus[LAYERS[t.gap + 1].id] ?? 0,
      )
      // Fade in at both ends of the run so nothing pops into existence.
      const ends = Math.sin(Math.PI * u)
      const strength = opened * ends * (0.25 + near * 0.75)

      const scale = 0.55 + strength * 1.1
      dummy.position.set(t.x, y, t.z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      colour.copy(accents[t.gap + 1]).multiplyScalar(0.35 + strength * 1.5)
      mesh.setColorAt(i, colour)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <lineSegments ref={lines} geometry={lineGeom}>
        <lineBasicMaterial color="#4a5a72" transparent opacity={0} />
      </lineSegments>

      <instancedMesh
        ref={points}
        args={[undefined, undefined, tracks.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
      </instancedMesh>
    </group>
  )
}
