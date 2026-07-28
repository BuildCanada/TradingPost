"use client";

import * as THREE from "three";
import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useCursor, useTexture } from "@react-three/drei";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
/* The draggable commemorative stamp on a region's pledge page. The artwork is
   passed in (`stampSrc`) so each election supplies its own — every stamp is
   square, so the geometry is shared. */

/* Stamp dimensions in world units (the artwork is square) */
const STAMP_SIZE = 2.7;

/* Resting tilt, like a stamp pressed on by hand */
const REST_TILT = -8 * (Math.PI / 180);
/* z component of the resting quaternion (rotation of REST_TILT about z) */
const REST_QZ = Math.sin(REST_TILT / 2);

function Stamp({ stampSrc }: { stampSrc: string }) {
  const body = useRef<RapierRigidBody>(null);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);
  useCursor(hovered, dragged ? "grabbing" : "grab");

  const map = useTexture(stampSrc, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
  });

  useFrame((state, delta) => {
    if (!body.current) return;

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      body.current.wakeUp();
      body.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    } else {
      // spring gently back toward centre so a thrown stamp never gets lost
      const t = body.current.translation();
      const pull = body.current.mass() * 5 * delta;
      body.current.applyImpulse(
        { x: -t.x * pull, y: -t.y * pull, z: -t.z * pull },
        true,
      );
      // and ease back to facing the camera, settling at the resting tilt
      ang.copy(body.current.angvel());
      rot.copy(body.current.rotation());
      body.current.setAngvel(
        {
          x: ang.x - rot.x * 0.5,
          y: ang.y - rot.y * 0.5,
          z: ang.z - (rot.z - REST_QZ) * 0.5,
        },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={body}
      rotation={[0, 0, REST_TILT]}
      type={dragged ? "kinematicPosition" : "dynamic"}
      colliders={false}
      canSleep={false}
      linearDamping={2}
      angularDamping={2}
    >
      <CuboidCollider args={[STAMP_SIZE / 2, STAMP_SIZE / 2, 0.02]} />
      <group
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        onPointerUp={(e) => {
          (e.target as Element).releasePointerCapture(e.pointerId);
          drag(false);
        }}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture(e.pointerId);
          if (!body.current) return;
          drag(
            new THREE.Vector3()
              .copy(e.point)
              .sub(vec.copy(body.current.translation())),
          );
        }}
      >
        {/* unlit + untonemapped so the artwork renders exactly as authored —
            ACES tone mapping and env lighting wash out the soft blues */}
        <mesh>
          <planeGeometry args={[STAMP_SIZE, STAMP_SIZE]} />
          <meshBasicMaterial
            map={map}
            transparent
            alphaTest={0.3}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

export default function StampScene({ stampSrc }: { stampSrc: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 25 }}
      gl={{ alpha: true }}
      style={{ touchAction: "none" }}
    >
      {/* Physics suspends while the rapier WASM loads; the boundary must sit
          inside the Canvas or the suspension unmounts it and kills the GL context */}
      <Suspense fallback={null}>
        <Physics gravity={[0, 0, 0]} timeStep={1 / 60}>
          <Stamp stampSrc={stampSrc} />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
