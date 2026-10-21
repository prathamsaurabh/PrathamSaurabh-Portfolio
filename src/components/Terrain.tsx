import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { scene } from '../sceneStore';

// Tuning knobs
const VIBRATION = 0.05; // height of the constant fine vibration
const DRIFT = 0.16; // height of the slow rolling wave
const BG = '#030303';

// Grid size (world units) and resolution
const WIDTH = 64;
const DEPTH = 44;
const COLS = 72;
const ROWS = 50;
const Z_OFFSET = -14; // pushes the grid away from the camera
const X_SHIFT = WIDTH / COLS / 2; // keeps a grid line from sitting dead-center (it'd look like a straight vertical line)

const noise = /* glsl */ `
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod(i,289.);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m; m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}`;

const vertex = /* glsl */ `
uniform float uTime;
uniform float uVibration;
uniform float uDrift;
varying float vDepth;
varying float vHeight;
${noise}
float terrain(vec2 p){
  vec2 q=p*.07+vec2(3.1,1.7);
  float n=snoise(q)*.75+snoise(q*2.2+5.3)*.25;
  n=pow(n*.5+.5,1.5)*5.2;
  float back=(1.-smoothstep(-22.,10.,p.y));     // taller toward the horizon
  float sideCalm=1.-(1.-smoothstep(0.,4.,abs(p.x)))*.35*(1.-back); // keep the middle front a bit lower
  return n*(.35+.9*back)*sideCalm;
}
void main(){
  vec3 p=position;
  float t=uTime;
  float h=terrain(p.xz);
  // slow rolling wave across the surface
  h+=uDrift*sin(p.x*.32-t*.9)*sin(p.z*.27+t*.6);
  // constant fine vibration
  h+=uVibration*(sin(t*7.3+p.x*1.1+p.z*.8)*.6+sin(t*11.1-p.x*1.7+p.z*1.3)*.4);
  p.y=h;
  vHeight=h;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  vDepth=-mv.z;
  gl_Position=projectionMatrix*mv;
  #ifdef SOLID
  gl_Position.z+=.0015*gl_Position.w; // sit just behind the lines so they win the depth test
  #endif
}`;

const lineFragment = /* glsl */ `
uniform float uOpacity;
varying float vDepth;
varying float vHeight;
void main(){
  float fade=(1.-smoothstep(12.,48.,vDepth))*smoothstep(1.5,5.,vDepth);
  float lift=.65+.35*smoothstep(0.,3.,vHeight);
  gl_FragColor=vec4(vec3(1.),uOpacity*fade*lift);
}`;

const solidFragment = /* glsl */ `
uniform vec3 uBg;
void main(){ gl_FragColor=vec4(uBg,1.); }`;

function buildLineGrid() {
  const pos: number[] = [];
  const dx = WIDTH / COLS;
  const dz = DEPTH / ROWS;
  const x0 = -WIDTH / 2 + X_SHIFT;
  const z0 = -DEPTH / 2 + Z_OFFSET;
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const z = z0 + r * dz;
      pos.push(x0 + c * dx, 0, z, x0 + (c + 1) * dx, 0, z);
    }
  }
  for (let c = 0; c <= COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const x = x0 + c * dx;
      pos.push(x, 0, z0 + r * dz, x, 0, z0 + (r + 1) * dz);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

function buildSurface() {
  const g = new THREE.PlaneGeometry(WIDTH, DEPTH, COLS, ROWS);
  g.rotateX(-Math.PI / 2);
  g.translate(X_SHIFT, 0, Z_OFFSET);
  return g;
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Camera poses: "welcome" looks off to the left, "main" is centered.
const welcomePos = new THREE.Vector3(-17, 2.2, 9);
const welcomeLook = new THREE.Vector3(-15, 1.4, -6);
const mainPos = new THREE.Vector3(0, 3.4, 12);
const mainLook = new THREE.Vector3(0, 1.2, -6);

function Landscape({ still }: { still: boolean }) {
  const { camera } = useThree();
  const lines = useMemo(buildLineGrid, []);
  const surface = useMemo(buildSurface, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVibration: { value: still ? 0 : VIBRATION },
      uDrift: { value: still ? 0 : DRIFT },
      uOpacity: { value: 0.85 },
      uBg: { value: new THREE.Color(BG) },
    }),
    [still],
  );
  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: lineFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms],
  );
  const solidMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: solidFragment,
        uniforms,
        defines: { SOLID: '' },
      }),
    [uniforms],
  );

  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!still) uniforms.uTime.value = t;

    // pan progress (time based tween once the welcome stage ends)
    let p = 0;
    if (scene.panStart !== null) p = still ? 1 : ease(Math.min((performance.now() - scene.panStart) / 2400, 1));

    pos.lerpVectors(welcomePos, mainPos, p);
    look.lerpVectors(welcomeLook, mainLook, p);

    // scrolling lifts the camera and tilts it down over the terrain
    const s = Math.min(scene.scroll, 1.5);
    pos.y += s * 2.2;
    pos.z -= s * 2.5;
    look.y -= s * 1.2;

    // gentle mouse parallax
    mouse.lerp(state.pointer, Math.min(delta * 2, 1));
    pos.x += mouse.x * 0.6;
    pos.y += mouse.y * 0.3;

    camera.position.copy(pos);
    camera.lookAt(look);
  });

  return (
    <>
      <mesh geometry={surface} material={solidMat} renderOrder={0} />
      <lineSegments geometry={lines} material={lineMat} renderOrder={1} />
    </>
  );
}

export default function Terrain({ still = false }: { still?: boolean }) {
  return (
    <div className="terrain" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [welcomePos.x, welcomePos.y, welcomePos.z], fov: 50, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(BG)}
      >
        <Landscape still={still} />
      </Canvas>
    </div>
  );
}
