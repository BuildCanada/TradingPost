"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useCursor, useTexture } from "@react-three/drei";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import stampImage from "./toronto-stamp.png";

/* Stamp dimensions in world units (the artwork is square) */
const STAMP_SIZE = 2.7;

/* Resting tilt, like a stamp pressed on by hand */
const REST_TILT = -8 * (Math.PI / 180);
/* z component of the resting quaternion (rotation of REST_TILT about z) */
const REST_QZ = Math.sin(REST_TILT / 2);

/* ─── Postmark: wavy cancellation lines + typewriter frame, drawn in ink ─── */

const INK = "#2e5fa3";
const TYPEWRITER = '"Courier New", Courier, monospace';

function bevelRectPath(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  b: number,
) {
  ctx.beginPath();
  ctx.moveTo(x0 + b, y0);
  ctx.lineTo(x1 - b, y0);
  ctx.lineTo(x1, y0 + b);
  ctx.lineTo(x1, y1 - b);
  ctx.lineTo(x1 - b, y1);
  ctx.lineTo(x0 + b, y1);
  ctx.lineTo(x0, y1 - b);
  ctx.lineTo(x0, y0 + b);
  ctx.closePath();
}

function drawPostmark(name: string): HTMLCanvasElement {
  const W = 1400;
  const H = 700;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // cancellation waves — four parallel curves running off to the left,
  // ending where the frame begins
  ctx.lineWidth = 10;
  for (let i = 0; i < 4; i++) {
    const y0 = 240 + i * 55;
    ctx.beginPath();
    for (let x = 30; x <= 530; x += 8) {
      const y = y0 + Math.sin(x / 110) * 16;
      if (x === 30) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // the frame — a stretched hexagon with beveled corners
  const fx0 = 520;
  const fy0 = 140;
  const fx1 = 1370;
  const fy1 = 560;
  const cx = (fx0 + fx1) / 2;
  ctx.lineWidth = 12;
  bevelRectPath(ctx, fx0, fy0, fx1, fy1, 80);
  ctx.stroke();

  // asterisk ornaments, top and bottom centre
  ctx.textAlign = "center";
  ctx.font = `700 84px ${TYPEWRITER}`;
  ctx.fillText("*", cx, 225);
  ctx.fillText("*", cx, 610);

  // the pledger's name — typewriter caps, shrunk to fit the frame
  const display = (name.trim() || "A Toronto Voter").toUpperCase();
  let size = 110;
  ctx.font = `700 ${size}px ${TYPEWRITER}`;
  while (ctx.measureText(display).width > 720 && size > 44) {
    size -= 4;
    ctx.font = `700 ${size}px ${TYPEWRITER}`;
  }
  ctx.fillText(display, cx, 330);

  // pledge date, dd.mm.yyyy
  const now = new Date();
  const date = [
    String(now.getDate()).padStart(2, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    now.getFullYear(),
  ].join(".");
  ctx.font = `700 60px ${TYPEWRITER}`;
  ctx.fillText(date, cx, 415);

  // corner marks
  ctx.font = `700 44px ${TYPEWRITER}`;
  ctx.textAlign = "left";
  ctx.fillText("TORONTO", fx0 + 80, 505);
  ctx.textAlign = "right";
  ctx.fillText("#02026", fx1 - 80, 505);

  // distress the ink so it reads as hand-stamped
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 1100; i++) {
    ctx.globalAlpha = 0.35 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(
      Math.random() * W,
      100 + Math.random() * (H - 180),
      0.8 + Math.random() * 4.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  return canvas;
}

/* The cancellation mark, pressed over the stamp with a quick thump */
function Postmark({ name }: { name: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const progress = useRef(0);

  const map = useMemo(() => {
    const tex = new THREE.CanvasTexture(drawPostmark(name));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, [name]);
  useEffect(() => () => map.dispose(), [map]);

  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta * 5);
    const t = progress.current;
    const ease = 1 - (1 - t) ** 3;
    mesh.current?.scale.setScalar(1 + (1 - ease) * 0.8);
    if (material.current) material.current.opacity = ease * 0.78;
  });

  return (
    <mesh
      ref={mesh}
      position={[-1.1, 1.15, 0.04]}
      rotation={[0, 0, 12 * (Math.PI / 180)]}
      renderOrder={1}
    >
      <planeGeometry args={[2.4, 1.2]} />
      <meshBasicMaterial
        ref={material}
        map={map}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Stamp({ postmarkName }: { postmarkName: string | null }) {
  const body = useRef<RapierRigidBody>(null);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);
  useCursor(hovered, dragged ? "grabbing" : "grab");

  const map = useTexture(stampImage.src, (tex) => {
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
        {postmarkName !== null && <Postmark name={postmarkName} />}
      </group>
    </RigidBody>
  );
}

export default function StampScene({
  postmarkName = null,
}: {
  /** when set, a cancellation mark with this name is pressed over the stamp */
  postmarkName?: string | null;
}) {
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
          <Stamp postmarkName={postmarkName} />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
