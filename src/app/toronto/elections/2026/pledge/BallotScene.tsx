"use client";

import * as THREE from "three";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  type ThreeElement,
} from "@react-three/fiber";
import { Environment, Lightformer, useCursor } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

/* ─── Palette ─── */
/* darker than the target colour (#932f2f) — ACES tone mapping + env lighting lift it */
const CARD_RED = "#5e1d1d";
const CARD_RED_EDGE = "#431414";
const OFF_WHITE = "#f4f2ec";
const STRAP_RED = "#932f2f";
const STRAP_RED_DARK = "#6e2222";
const STRAP_RED_LIGHT = "#a84343";

/* Card dimensions in world units */
const CARD_W = 1.6;
const CARD_H = 2.25;
const CARD_D = 0.07;

/* ─── Strap: woven-nylon tile, repeated along the band length ─── */
function drawStrapTile(): HTMLCanvasElement {
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = STRAP_RED;
  ctx.fillRect(0, 0, S, S);

  // twill weave: two crossing diagonal thread directions
  ctx.lineWidth = 5;
  ctx.strokeStyle = STRAP_RED_DARK;
  ctx.globalAlpha = 0.55;
  for (let i = -S; i < S * 2; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + S, S);
    ctx.stroke();
  }
  ctx.strokeStyle = STRAP_RED_LIGHT;
  ctx.globalAlpha = 0.35;
  for (let i = -S; i < S * 2; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i + 8, 0);
    ctx.lineTo(i + 8 - S, S);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // rounded shading: darken toward both edges of the strap (v axis)
  const shade = ctx.createLinearGradient(0, 0, 0, S);
  shade.addColorStop(0, "rgba(0,0,0,0.45)");
  shade.addColorStop(0.18, "rgba(0,0,0,0)");
  shade.addColorStop(0.82, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, S, S);

  // stitch lines near the edges
  ctx.strokeStyle = STRAP_RED_LIGHT;
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.globalAlpha = 0.9;
  for (const y of [16, S - 16]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  return canvas;
}

/* ─── Clasp: brushed metal with a strap slot ─── */
function drawClaspFace(): HTMLCanvasElement {
  const W = 256;
  const H = 160;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#c6c6c6";
  ctx.fillRect(0, 0, W, H);

  // brushed-metal streaks
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * H;
    const w = 30 + Math.random() * 120;
    const x = Math.random() * (W - w);
    const l = 150 + Math.random() * 90;
    ctx.strokeStyle = `rgba(${l},${l},${l},0.28)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }

  // bevel: bright top edge, dark bottom edge
  const bevel = ctx.createLinearGradient(0, 0, 0, H);
  bevel.addColorStop(0, "rgba(255,255,255,0.5)");
  bevel.addColorStop(0.12, "rgba(255,255,255,0)");
  bevel.addColorStop(0.85, "rgba(0,0,0,0)");
  bevel.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = bevel;
  ctx.fillRect(0, 0, W, H);

  // slot the straps thread through
  const sx = 34;
  const sy = 28;
  const sw = W - 68;
  const sh = 26;
  ctx.fillStyle = "#3c3c3c";
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 13);
  ctx.fill();
  const slotShade = ctx.createLinearGradient(0, sy, 0, sy + sh);
  slotShade.addColorStop(0, "rgba(0,0,0,0.7)");
  slotShade.addColorStop(1, "rgba(255,255,255,0.18)");
  ctx.fillStyle = slotShade;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 13);
  ctx.fill();

  // rivets in the lower corners
  for (const rx of [30, W - 30]) {
    const rg = ctx.createRadialGradient(rx - 2, H - 34, 1, rx, H - 32, 9);
    rg.addColorStop(0, "#efefef");
    rg.addColorStop(0.7, "#9a9a9a");
    rg.addColorStop(1, "#6f6f6f");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rx, H - 32, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

const SANS = '"Soehne Kraftig", system-ui, sans-serif';

/* Draw a poster row: heavy type horizontally squeezed/stretched to
   exactly fill targetW, mimicking justified condensed display type */
function posterRow(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  baseline: number,
  x: number,
  targetW: number,
) {
  ctx.font = `800 ${size}px ${SANS}`;
  ctx.textAlign = "left";
  const natural = ctx.measureText(text).width;
  const scaleX = targetW / natural;
  ctx.save();
  ctx.translate(x, baseline);
  ctx.scale(scaleX, 1);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function letterSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  x: number,
  y: number,
  spacing: number,
  align: CanvasTextAlign = "left",
) {
  ctx.font = font;
  ctx.textAlign = align;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
    `${spacing}px`;
  ctx.fillText(text, x, y);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
    "0px";
}

/* ─── Front face: I PLEDGE TO VOTE poster ─── */
function drawBallotFront(name: string): HTMLCanvasElement {
  const W = 1024;
  const H = 1440;
  const M = 64;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = CARD_RED;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = OFF_WHITE;

  // I — centered, natural width
  ctx.font = `800 360px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("I", W / 2, 385);

  // PLEDGE — justified edge to edge
  posterRow(ctx, "PLEDGE", 270, 655, M, W - 2 * M);

  // — TO — small, centered, flanked by rules
  const toBaseline = 800;
  const toFont = `700 110px ${SANS}`;
  ctx.font = toFont;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "24px";
  const toW = ctx.measureText("TO").width;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  letterSpaced(ctx, "TO", toFont, W / 2 + 12, toBaseline, 24, "center");
  const gap = 56;
  const ruleY = toBaseline - 36;
  ctx.fillRect(M, ruleY, W / 2 - toW / 2 - gap - M, 5);
  ctx.fillRect(W / 2 + toW / 2 + gap, ruleY, W - M - (W / 2 + toW / 2 + gap), 5);

  // VOTE — the biggest row, justified edge to edge
  posterRow(ctx, "VOTE", 425, 1160, M, W - 2 * M);

  // name between two centered rules
  const displayName = (name.trim() || "Your Name").toUpperCase();
  const spacing = 22;
  let size = 52;
  ctx.font = `600 ${size}px ${SANS}`;
  while (ctx.measureText(displayName).width + spacing * displayName.length > 600 && size > 26) {
    size -= 2;
    ctx.font = `600 ${size}px ${SANS}`;
  }
  const ruleW = 560;
  ctx.fillRect(W / 2 - ruleW / 2, 1256, ruleW, 3);
  letterSpaced(ctx, displayName, `600 ${size}px ${SANS}`, W / 2 + spacing / 2, 1324, spacing, "center");
  ctx.fillRect(W / 2 - ruleW / 2, 1356, ruleW, 3);

  return canvas;
}

/* ─── Back face ─── */
function drawBallotBack(): HTMLCanvasElement {
  const W = 1024;
  const H = 1440;
  const M = 64;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = CARD_RED;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = OFF_WHITE;

  letterSpaced(ctx, "PLEDGE BADGE", `600 34px ${SANS}`, W - M, 128, 12, "right");

  posterRow(ctx, "TORONTO", 250, 640, M, W - 2 * M);
  posterRow(ctx, "2026", 250, 880, M + 180, W - 2 * M - 360);

  letterSpaced(ctx, "MONDAY, OCTOBER 26", `600 40px ${SANS}`, M, 1300, 10);
  ctx.fillRect(M, 1326, W - 2 * M, 3);
  letterSpaced(ctx, "BUILDCANADA.COM/TORONTO", `600 34px ${SANS}`, M, 1404, 8);
  ctx.fillRect(W - M - 84, 1382, 84, 18);

  return canvas;
}

function useBallotTextures(name: string) {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // fontsReady re-creates the textures once webfonts arrive, so the
  // first paint isn't stuck with fallback Georgia
  const front = useMemo(() => {
    void fontsReady;
    const tex = new THREE.CanvasTexture(drawBallotFront(name));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, [name, fontsReady]);

  const back = useMemo(() => {
    void fontsReady;
    const tex = new THREE.CanvasTexture(drawBallotBack());
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, [fontsReady]);

  useEffect(() => () => front.dispose(), [front]);
  useEffect(() => () => back.dispose(), [back]);

  return { front, back };
}

/* ─── The hanging ballot + lanyard ─── */

type BodyRef = RefObject<RapierRigidBody>;

type Chain = {
  fixed: BodyRef;
  j1: BodyRef;
  j2: BodyRef;
  j3: BodyRef;
};

/* One side of the lanyard rig: anchor → three rope segments → card clamp */
function StrapChain({
  chain,
  card,
  side,
  segmentProps,
}: {
  chain: Chain;
  card: BodyRef;
  side: 1 | -1;
  segmentProps: object;
}) {
  const { fixed, j1, j2, j3 } = chain;
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [side * 0.1, 1.45, 0]]);

  return (
    <>
      <RigidBody ref={fixed} {...segmentProps} type="fixed" position={[side, 0, 0]} />
      <RigidBody position={[side * 0.667, -0.943, 0]} ref={j1} {...segmentProps}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody position={[side * 0.333, -1.886, 0]} ref={j2} {...segmentProps}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody position={[side * 0.1, -2.83, 0]} ref={j3} {...segmentProps}>
        <BallCollider args={[0.08]} />
      </RigidBody>
    </>
  );
}

function BallotBody({
  name,
  left,
  right,
  card,
  cardGroup,
}: {
  name: string;
  left: Chain;
  right: Chain;
  card: BodyRef;
  cardGroup: RefObject<THREE.Group>;
}) {
  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);
  useCursor(hovered, dragged ? "grabbing" : "grab");

  const { front, back } = useBallotTextures(name);

  const claspMap = useMemo(() => {
    const tex = new THREE.CanvasTexture(drawClaspFace());
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, []);
  useEffect(() => () => claspMap.dispose(), [claspMap]);

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  useFrame((state) => {
    if (!card.current) return;

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [
        card,
        left.j1, left.j2, left.j3,
        right.j1, right.j2, right.j3,
      ].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    } else {
      // gently face the camera when at rest
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  return (
    <group position={[0, 4, 0]}>
      <StrapChain chain={left} card={card} side={-1} segmentProps={segmentProps} />
      <StrapChain chain={right} card={card} side={1} segmentProps={segmentProps} />

      <RigidBody
        position={[0, -4.28, 0]}
        ref={card}
        {...segmentProps}
        type={dragged ? "kinematicPosition" : "dynamic"}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_D]} />
        <group
          ref={cardGroup}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerUp={(e) => {
            (e.target as Element).releasePointerCapture(e.pointerId);
            drag(false);
          }}
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture(e.pointerId);
            if (!card.current) return;
            drag(
              new THREE.Vector3()
                .copy(e.point)
                .sub(vec.copy(card.current.translation())),
            );
          }}
        >
          {/* the ballot card */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <meshPhysicalMaterial attach="material-0" color={CARD_RED_EDGE} roughness={0.9} />
            <meshPhysicalMaterial attach="material-1" color={CARD_RED_EDGE} roughness={0.9} />
            <meshPhysicalMaterial attach="material-2" color={CARD_RED_EDGE} roughness={0.9} />
            <meshPhysicalMaterial attach="material-3" color={CARD_RED_EDGE} roughness={0.9} />
            <meshPhysicalMaterial
              attach="material-4"
              map={front}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
              roughness={0.85}
              metalness={0.05}
            />
            <meshPhysicalMaterial
              attach="material-5"
              map={back}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>

          {/* metal clamp — wide and deep enough to swallow both strap ends;
              brushed-metal face with the strap slot and rivets */}
          <mesh position={[0, CARD_H / 2 + 0.09, 0]}>
            <boxGeometry args={[0.44, 0.26, 0.18]} />
            <meshPhysicalMaterial attach="material-0" color="#b0b0b0" metalness={0.9} roughness={0.35} />
            <meshPhysicalMaterial attach="material-1" color="#b0b0b0" metalness={0.9} roughness={0.35} />
            <meshPhysicalMaterial attach="material-2" color="#b0b0b0" metalness={0.9} roughness={0.35} />
            <meshPhysicalMaterial attach="material-3" color="#b0b0b0" metalness={0.9} roughness={0.35} />
            <meshPhysicalMaterial attach="material-4" map={claspMap} metalness={0.85} roughness={0.35} />
            <meshPhysicalMaterial attach="material-5" map={claspMap} metalness={0.85} roughness={0.35} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
}

/* Mounted AFTER <Physics> so its frame callback runs once the physics step
   has written fresh transforms. The strap's end point is derived from the
   card group's rendered world matrix — the exact pose the card is drawn
   with this frame — so the seam cannot lag or flicker during fast motion. */
function LanyardStrap({
  chain,
  cardGroup,
  endLocal,
  zLift,
  maxSpeed = 50,
  minSpeed = 10,
}: {
  chain: Chain;
  cardGroup: RefObject<THREE.Group>;
  endLocal: [number, number, number];
  zLift: number;
  maxSpeed?: number;
  minSpeed?: number;
}) {
  const band = useRef<THREE.Mesh<MeshLineGeometry, MeshLineMaterial>>(null);
  const endWorld = useMemo(() => new THREE.Vector3(), []);
  const lerped = useRef({
    j1: new THREE.Vector3(),
    j2: new THREE.Vector3(),
    init: false,
  });

  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = "chordal";
    return c;
  }, []);

  const { width, height } = useThree((state) => state.size);
  const resolution = useMemo(
    () => new THREE.Vector2(width, height),
    [width, height],
  );

  const strapMap = useMemo(() => {
    const tex = new THREE.CanvasTexture(drawStrapTile());
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, []);
  useEffect(() => () => strapMap.dispose(), [strapMap]);
  const strapRepeat = useMemo(() => new THREE.Vector2(7, 1), []);

  useFrame((_, delta) => {
    if (!chain.fixed.current || !chain.j1.current || !chain.j2.current || !cardGroup.current || !band.current) return;

    // end point: inside the clamp, in the card's rendered pose
    cardGroup.current.updateWorldMatrix(true, false);
    endWorld.set(...endLocal).applyMatrix4(cardGroup.current.matrixWorld);

    // smooth out the upper joints so the strap doesn't jitter
    if (!lerped.current.init) {
      lerped.current.init = true;
      lerped.current.j1.copy(chain.j1.current.translation());
      lerped.current.j2.copy(chain.j2.current.translation());
    }
    (
      [
        [lerped.current.j1, chain.j1.current],
        [lerped.current.j2, chain.j2.current],
      ] as const
    ).forEach(([lerp, body]) => {
      const t = body.translation();
      const clamped = Math.max(0.1, Math.min(1, lerp.distanceTo(t)));
      lerp.lerp(t, delta * (minSpeed + clamped * (maxSpeed - minSpeed)));
    });

    // free-hanging points ride slightly in front of the card plane so the
    // ribbon never sits at equal depth with the card face (no z-fighting);
    // each strap gets its own zLift so the two never sit coplanar either
    curve.points[0].copy(endWorld);
    curve.points[1].copy(lerped.current.j2).z += zLift;
    curve.points[2].copy(lerped.current.j1).z += zLift;
    curve.points[3].copy(chain.fixed.current.translation()).z += zLift;
    band.current.geometry.setPoints(curve.getPoints(32));
  });

  return (
    <mesh ref={band}>
      <meshLineGeometry />
      <meshLineMaterial
        args={[{ resolution }]}
        color="white"
        map={strapMap}
        useMap={1}
        repeat={strapRepeat}
        resolution={resolution}
        lineWidth={0.5}
      />
    </mesh>
  );
}

export default function BallotScene({ name }: { name: string }) {
  const fixedL = useRef<RapierRigidBody>(null!);
  const j1L = useRef<RapierRigidBody>(null!);
  const j2L = useRef<RapierRigidBody>(null!);
  const j3L = useRef<RapierRigidBody>(null!);
  const fixedR = useRef<RapierRigidBody>(null!);
  const j1R = useRef<RapierRigidBody>(null!);
  const j2R = useRef<RapierRigidBody>(null!);
  const j3R = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const cardGroup = useRef<THREE.Group>(null!);

  const left: Chain = { fixed: fixedL, j1: j1L, j2: j2L, j3: j3L };
  const right: Chain = { fixed: fixedR, j1: j1R, j2: j2R, j3: j3R };

  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 25 }}
      gl={{ alpha: true }}
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={Math.PI} />
      {/* Physics suspends while the rapier WASM loads; the boundary must sit
          inside the Canvas or the suspension unmounts it and kills the GL context */}
      <Suspense fallback={null}>
        <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
          <BallotBody
            name={name}
            left={left}
            right={right}
            card={card}
            cardGroup={cardGroup}
          />
        </Physics>
        {/* keep these after <Physics> — see LanyardStrap */}
        <LanyardStrap
          chain={left}
          cardGroup={cardGroup}
          endLocal={[-0.1, CARD_H / 2 + 0.04, 0.025]}
          zLift={0.06}
        />
        <LanyardStrap
          chain={right}
          cardGroup={cardGroup}
          endLocal={[0.1, CARD_H / 2 + 0.04, 0.035]}
          zLift={0.075}
        />
      </Suspense>
      <Environment blur={0.75}>
        <Lightformer
          intensity={2}
          color="white"
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={10}
          color="white"
          position={[-10, 0, 14]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>
    </Canvas>
  );
}
