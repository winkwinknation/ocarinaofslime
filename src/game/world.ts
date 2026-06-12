// Mutable per-frame world state, kept OUTSIDE zustand so 60fps updates don't re-render React.
import * as THREE from 'three'
import type { Collider } from './collision'

export const player = {
  pos: new THREE.Vector3(0, 0, 0),
  heading: 0, // radians; direction the player faces / moves
  moving: false,
  speedMul: 1, // riding horse / zoomies cheat
  riding: false,
  attackTimer: 0,
  rollTimer: 0,
  invulnTimer: 0,
  frozen: false, // dialogue / cutscene / ocarina / pause
  bounce: 0, // squash-and-stretch phase
  kbX: 0,
  kbZ: 0,
  kbTimer: 0,
}

/** Shove the player away from (fromX, fromZ). Used by enemy contact damage. */
export function knockbackPlayer(fromX: number, fromZ: number, force = 9) {
  const dx = player.pos.x - fromX
  const dz = player.pos.z - fromZ
  const d = Math.hypot(dx, dz) || 1
  player.kbX = (dx / d) * force
  player.kbZ = (dz / d) * force
  player.kbTimer = 0.25
}

export const cam = { yaw: 0 }

export interface Interactable {
  id: string
  x: number
  z: number
  radius: number
  label: string // shown as "(A) label"
  onInteract: () => void
  enabled?: () => boolean
}
export const interactables = new Map<string, Interactable>()

export interface EnemyRef {
  id: string
  pos: THREE.Vector3
  radius: number
  alive: boolean
  hit: (dmg: number, fromX: number, fromZ: number) => void
}
export const enemies = new Map<string, EnemyRef>()

/** Things the sword breaks but that don't fight back: grass, pots, etc. */
export interface BreakableRef {
  id: string
  x: number
  z: number
  radius: number
  broken: boolean
  smash: () => void
}
export const breakables = new Map<string, BreakableRef>()

export const sceneColliders: Collider[] = []

export function setColliders(list: Collider[]) {
  sceneColliders.length = 0
  sceneColliders.push(...list)
}

export function clearSceneState() {
  interactables.clear()
  enemies.clear()
  breakables.clear()
  sceneColliders.length = 0
}

export function spawnPlayer(x: number, z: number, heading = 0) {
  player.pos.set(x, 0, z)
  player.heading = heading
  cam.yaw = heading
  player.attackTimer = 0
  player.rollTimer = 0
  player.invulnTimer = 0
  player.riding = false
  player.speedMul = 1
  player.kbTimer = 0
}
