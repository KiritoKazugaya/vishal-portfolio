"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

import { PHASES, assembledY, type LayerDef } from "@/lib/chip-config"
import { chipState, damp, range, smooth } from "@/lib/scroll-store"

interface Props {
  def: LayerDef
  index: number
  total: number
}

/**
 * One slab of the package.
 *
 * BoxGeometry material order is [+X, -X, +Y, -Y, +Z, -Z], so index 2 is the
 * top face — that's where the layer's artwork goes. The other five faces are
 * dark substrate, which is what you see once the stack separates.
 */
export function ChipLayer({ def, index, total }: Props) {
  const mesh = useRef<THREE.Mesh>(null)
  const topMat = useRef<THREE.MeshStandardMaterial>(null)
  const sideMat = useRef<THREE.MeshStandardMaterial>(null)
  const edgeRef = useRef<THREE.LineSegments>(null)

  const texture = useTexture(def.texture)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  const restY = useMemo(() => assembledY(index), [index])
  const accent = useMemo(() => new THREE.Color(def.accent), [def.accent])
  const emissive = useMemo(() => new THREE.Color(def.emissive), [def.emissive])

  const edgeGeom = useMemo(() => {
    const box = new THREE.BoxGeometry(def.size, def.thickness, def.size)
    const edges = new THREE.EdgesGeometry(box, 25)
    box.dispose()
    return edges
  }, [def.size, def.thickness])

  useEffect(() => () => edgeGeom.dispose(), [edgeGeom])

  /** Top layers begin separating first, so the stack peels rather than pops. */
  const stagger = index / Math.max(1, total - 1)

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(delta, 1 / 30)

    const [sepStart, sepEnd] = PHASES.separate
    const span = sepEnd - sepStart
    const local = range(chipState.hero, sepStart + stagger * span * 0.28, sepEnd)
    const spread = chipState.reduced ? 1 : smooth(local)

    const targetY = restY + (def.separatedY - restY) * spread
    m.position.y = damp(m.position.y, targetY, 7, dt)

    // Focus: the active chapter's layer sits brighter than its neighbours.
    const focus = chipState.focus[def.id] ?? 0
    const power = range(chipState.hero, PHASES.power[0], PHASES.power[1])

    if (topMat.current) {
      const target = 0.16 + focus * 0.85 + power * 0.25
      topMat.current.emissiveIntensity = damp(topMat.current.emissiveIntensity, target, 6, dt)
      // Dim the artwork of inactive layers rather than hiding them.
      const tone = 0.45 + focus * 0.55
      topMat.current.color.setScalar(damp(topMat.current.color.r, tone, 6, dt))
    }

    if (sideMat.current) {
      const target = 0.05 + focus * 0.5
      sideMat.current.emissiveIntensity = damp(sideMat.current.emissiveIntensity, target, 6, dt)
    }

    if (edgeRef.current) {
      const mat = edgeRef.current.material as THREE.LineBasicMaterial
      const target = 0.1 + focus * 0.75 + spread * 0.15
      mat.opacity = damp(mat.opacity, target, 6, dt)
    }
  })

  return (
    <group>
      <mesh ref={mesh} position={[0, restY, 0]} castShadow receiveShadow>
        <boxGeometry args={[def.size, def.thickness, def.size]} />
        {/* Sides: dark substrate with an accent glow when the layer is active. */}
        <meshStandardMaterial
          ref={sideMat}
          attach="material-0"
          color="#15151a"
          emissive={emissive}
          emissiveIntensity={0.05}
          roughness={0.62}
          metalness={0.45}
        />
        <meshStandardMaterial attach="material-1" color="#15151a" emissive={emissive} emissiveIntensity={0.05} roughness={0.62} metalness={0.45} />
        {/* Top: the layer's artwork. */}
        <meshStandardMaterial
          ref={topMat}
          attach="material-2"
          map={texture}
          emissiveMap={texture}
          emissive={accent}
          emissiveIntensity={0.16}
          roughness={0.42}
          metalness={0.58}
        />
        <meshStandardMaterial attach="material-3" color="#0d0d10" roughness={0.8} metalness={0.3} />
        <meshStandardMaterial attach="material-4" color="#15151a" emissive={emissive} emissiveIntensity={0.05} roughness={0.62} metalness={0.45} />
        <meshStandardMaterial attach="material-5" color="#15151a" emissive={emissive} emissiveIntensity={0.05} roughness={0.62} metalness={0.45} />

        {/* Child of the slab so edge lighting travels with it during separation. */}
        <lineSegments ref={edgeRef} geometry={edgeGeom}>
          <lineBasicMaterial color={def.accent} transparent opacity={0.1} />
        </lineSegments>
      </mesh>
    </group>
  )
}
