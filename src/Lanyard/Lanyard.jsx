/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider, CuboidCollider, Physics,
  RigidBody, useRopeJoint, useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '../../assets/card.glb';
import lanyardPng from '../../assets/lanyard.png';
import portraitSrc from '../../assets/me-black.png';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

/* ── Logo path data extracted from the site's nav SVG ── */
const LOGO_PATH =
  'M1532.97,958.42c-122.32-152.05-230.78-297.72-397.94-398.73-109.63-66.24-241.31-67.39-350.26,1.45-108.64,68.65-199.65,156.55-281.51,255.53l-118.09,142.78c-23.13,1.77-44.23,2.53-68.73-3.44L856.56,217.87c36.78-29.29,30.47-70.29,79.58-83.86,38.23-10.57,78.59-4.67,92.79,29.09l49.79,65.17,109.71,151.21,88.45,121.07,72.48,101.47,59.14,83.86,195.07,269.76c-23.27,4.98-45.11,6.04-70.61,2.79Z';

function buildCardTexture() {
  const W = 1024, H = 638;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  /* dark base */
  ctx.fillStyle = '#070503';
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(canvas);

  function drawLogo(ctx) {
    ctx.save();
    /* viewBox="400 100 1200 900" → render at (44, 36) as 78×58px */
    const s = 78 / 1200;
    ctx.translate(44, 36);
    ctx.scale(s, s);
    ctx.translate(-400, -100);
    ctx.fillStyle = '#f59e0b';
    ctx.fill(new Path2D(LOGO_PATH));
    /* ellipse dot */
    ctx.beginPath();
    ctx.ellipse(962.57, 767.1, 123.42, 123.49, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawText(ctx) {
    /* amber top accent bar */
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(44, 126, 3, 72);

    /* name */
    ctx.fillStyle = 'rgba(245,240,232,0.96)';
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.fillText('Ahmed', 58, 178);
    ctx.fillText('Alnoor', 58, 254);

    /* title */
    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.fillText('BRAND ARCHITECT  ·  UAE', 58, 302);

    /* divider */
    ctx.fillStyle = 'rgba(245,158,11,0.22)';
    ctx.fillRect(44, 322, 280, 1);

    /* email */
    ctx.fillStyle = 'rgba(245,240,232,0.35)';
    ctx.font = '13px monospace';
    ctx.fillText('ahmed.m.alnoor@gmail.com', 44, 348);
  }

  const img = new Image();
  img.onload = () => {
    /* portrait on right — clip to right half */
    const aspect = img.width / img.height;
    const ph = H;
    const pw = ph * aspect;
    ctx.save();
    ctx.beginPath();
    ctx.rect(W - pw - 10, 0, pw + 10, H);
    ctx.clip();
    ctx.drawImage(img, W - pw - 10, 0, pw + 10, ph);
    ctx.restore();

    /* gradient blend so left text stays readable */
    const grad = ctx.createLinearGradient(380, 0, 560, 0);
    grad.addColorStop(0, '#070503');
    grad.addColorStop(1, 'rgba(7,5,3,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(360, 0, 200, H);

    drawLogo(ctx);
    drawText(ctx);
    tex.needsUpdate = true;
  };
  img.src = portraitSrc;

  return tex;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef(), fixed = useRef(),
    j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();

  const vec = new THREE.Vector3(), ang = new THREE.Vector3(),
    rot = new THREE.Vector3(), dir = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic', canSleep: true, colliders: false,
    angularDamping: 4, linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardPng);
  const cardTexture = useMemo(() => buildCardTexture(), []);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(), new THREE.Vector3(),
      new THREE.Vector3(), new THREE.Vector3(),
    ])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(r => r.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const d = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + d * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardTexture}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
