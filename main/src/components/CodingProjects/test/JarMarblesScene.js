import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const FILL_COUNT = 28;
/** World-space marble radius after instance scale (geometry is unit sphere). */
const MARBLE_RADIUS = 0.074;
const JAR_INNER_R = 0.38;

/** Nudge stack colors toward candy pastels so the jar feels cohesive & soft. */
function pastelizeColor(hexOrName) {
  const c = new THREE.Color(hexOrName);
  const blush = new THREE.Color('#ffb8d0');
  const lilac = new THREE.Color('#dcc6ff');
  c.lerp(blush, 0.18);
  c.lerp(lilac, 0.08);
  c.lerp(new THREE.Color('#ffffff'), 0.14);
  return c;
}

function decomposeHide(mesh, index, backupMat, hide) {
  const dummy = new THREE.Object3D();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  backupMat.decompose(pos, quat, scl);
  dummy.position.copy(pos);
  dummy.quaternion.copy(quat);
  if (hide) dummy.scale.setScalar(0);
  else dummy.scale.copy(scl);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function MarblesInstanced({ techData, hoveredId, setHoveredId, positionsOut, backupOut, meshRef }) {
  const geom = useMemo(() => new THREE.SphereGeometry(1, 18, 14), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.4,
        metalness: 0.22,
        vertexColors: true,
        envMapIntensity: 0.88,
      }),
    []
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    backupOut.current = [];
    positionsOut.current = [];

    for (let i = 0; i < FILL_COUNT; i++) {
      const tech = techData[i % techData.length];
      let x;
      let y;
      let z;
      let tries = 0;
      do {
        const ang = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random()) * JAR_INNER_R;
        x = Math.cos(ang) * rr;
        z = Math.sin(ang) * rr;
        y = (Math.random() - 0.5) * 0.72;
        tries++;
      } while (Math.sqrt(x * x + z * z) > JAR_INNER_R * 0.92 && tries < 20);

      const s = 0.92 + Math.random() * 0.18;
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      dummy.scale.setScalar(MARBLE_RADIUS * s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      backupOut.current.push(dummy.matrix.clone());
      positionsOut.current.push(new THREE.Vector3(x, y, z));

      try {
        mesh.setColorAt(i, pastelizeColor(tech.color));
      } catch {
        mesh.setColorAt(i, pastelizeColor('#c9a8c8'));
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [meshRef, positionsOut, backupOut, techData]);

  const prevHover = useRef(null);
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !backupOut.current.length) return;
    const prev = prevHover.current;
    if (prev !== null) {
      decomposeHide(mesh, prev, backupOut.current[prev], false);
    }
    if (hoveredId !== null) {
      decomposeHide(mesh, hoveredId, backupOut.current[hoveredId], true);
    }
    mesh.instanceMatrix.needsUpdate = true;
    prevHover.current = hoveredId;
  }, [hoveredId, meshRef, backupOut]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geom, mat, FILL_COUNT]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) setHoveredId(e.instanceId);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredId(null);
      }}
    />
  );
}

function HeroMarble({ position, color }) {
  const ref = useRef();
  const col = useMemo(
    () => (color ? pastelizeColor(color) : new THREE.Color('#fff0f5')),
    [color]
  );
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.01;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
  });
  if (!position) return null;
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[MARBLE_RADIUS * 1.08, 40, 32]} />
      <meshPhysicalMaterial
        color={col}
        roughness={0.11}
        metalness={0.06}
        transmission={0.92}
        thickness={0.68}
        ior={1.5}
        clearcoat={0.92}
        clearcoatRoughness={0.07}
        envMapIntensity={1.15}
        sheen={0.35}
        sheenRoughness={0.45}
        sheenColor={new THREE.Color('#ffd0e8')}
      />
    </mesh>
  );
}

function useJarGlassMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#fbfdff',
        roughness: 0.045,
        metalness: 0,
        transmission: 0.985,
        thickness: 0.55,
        ior: 1.515,
        transparent: true,
        side: THREE.DoubleSide,
        envMapIntensity: 1.18,
        clearcoat: 0.35,
        clearcoatRoughness: 0.06,
        attenuationColor: new THREE.Color('#f5d8ec'),
        attenuationDistance: 0.95,
      }),
    []
  );
}

/** Mason-style jar: wall + thickened base + lip ring (reads clearer than a bare hollow tube). */
function GlassJar() {
  const glass = useJarGlassMaterial();
  const jarH = 0.92;
  const halfH = jarH / 2;
  const rTop = 0.5;
  const rBot = 0.43;

  return (
    <group renderOrder={1} position={[0, 0.02, 0]}>
      <mesh castShadow receiveShadow material={glass}>
        <cylinderGeometry args={[rTop, rBot, jarH, 56, 1, true]} />
      </mesh>
      <mesh
        position={[0, -halfH + 0.012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={glass}
      >
        <circleGeometry args={[rBot * 0.992, 48]} />
      </mesh>
      <mesh position={[0, -halfH - 0.055, 0]} castShadow receiveShadow material={glass}>
        <cylinderGeometry args={[rBot * 0.78, rBot * 0.58, 0.12, 40, 1, false]} />
      </mesh>
      <mesh position={[0, halfH + 0.015, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={glass}>
        <torusGeometry args={[rTop * 0.985, 0.038, 14, 60]} />
      </mesh>
    </group>
  );
}

function SceneContents({ techData, onFocusTech }) {
  const meshRef = useRef();
  const backupOut = useRef([]);
  const positionsOut = useRef([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!onFocusTech) return;
    if (hoveredId === null) {
      onFocusTech(null);
      return;
    }
    onFocusTech(techData[hoveredId % techData.length]);
  }, [hoveredId, onFocusTech, techData]);

  const heroTech = hoveredId !== null ? techData[hoveredId % techData.length] : null;
  let heroPos = null;
  if (hoveredId !== null && positionsOut.current[hoveredId]) {
    const p = positionsOut.current[hoveredId];
    heroPos = [p.x, p.y + MARBLE_RADIUS * 1.35, p.z];
  }

  return (
    <>
      <hemisphereLight skyColor="#ffd6ec" groundColor="#6a4a5e" intensity={0.55} />
      <ambientLight intensity={0.38} color="#ffe8f3" />
      <directionalLight
        color="#fff7fb"
        position={[4.2, 8.5, 4.8]}
        intensity={1.12}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3.2, 2.4, -2.2]} intensity={0.62} color="#ffb3d9" distance={8} decay={2} />
      <pointLight position={[2.8, 0.8, 2.2]} intensity={0.35} color="#dcc6ff" distance={7} decay={2} />
      <spotLight
        position={[0.2, 2.55, 1.9]}
        angle={0.52}
        penumbra={0.92}
        intensity={0.5}
        color="#fff0f6"
        castShadow
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#4a3548" roughness={0.91} metalness={0.06} />
      </mesh>

      <MarblesInstanced
        techData={techData}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        positionsOut={positionsOut}
        backupOut={backupOut}
        meshRef={meshRef}
      />

      <HeroMarble position={heroPos} color={heroTech?.color} />

      <GlassJar />

      <Environment preset="apartment" environmentIntensity={0.82} />

      <OrbitControls enablePan={false} minDistance={1.85} maxDistance={4.2} minPolarAngle={0.38} maxPolarAngle={Math.PI / 2} />
    </>
  );
}

/**
 * @param {{ techData: { name: string; color: string; description: string }[] }} props
 */
export function JarMarblesCanvas({ techData, onFocusTech }) {
  return (
    <Canvas
      shadows
      camera={{ position: [1.35, 0.58, 1.62], fov: 42 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.06;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        scene.background = new THREE.Color('#2a1f2e');
      }}
    >
      <SceneContents techData={techData} onFocusTech={onFocusTech} />
    </Canvas>
  );
}
