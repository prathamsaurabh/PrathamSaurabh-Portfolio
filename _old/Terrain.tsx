import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertex = `
uniform float uTime;
uniform vec2 uPointer;
varying float vHeight;
float landscape(vec2 p){
 float ridge=sin(p.x*.43 + sin(p.y*.24)*.9)*.7;
 float waves=sin(p.y*.52-p.x*.28)*.34 + sin(p.x*.9+p.y*.31)*.13;
 float valley=sin(p.x*.19+p.y*.21)*.47;
 return ridge + waves + valley;
}
void main(){
 vec3 p=position;
 float dist=length(p.xy-uPointer);
 float ripple=exp(-dist*dist*.075)*sin(dist*2.5-uTime*3.2)*.34;
 p.z=landscape(p.xy+vec2(uTime*.09,uTime*.16))*1.25+ripple;
 vHeight=p.z;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const fragment = `
uniform float uTime;
varying float vHeight;
void main(){
 float shade=smoothstep(-2.1,2.7,vHeight);
 vec3 low=vec3(.12,.22,.24);
 vec3 high=vec3(.52,.78,.73);
 vec3 color=mix(low,high,shade);
 gl_FragColor=vec4(color,.45+shade*.45);
}`;

function Mesh(){
 const ref=useRef<THREE.ShaderMaterial>(null);
 const pointer=useRef(new THREE.Vector2(100,100));
 const target=useRef(new THREE.Vector2(100,100));
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(42,32,85,64);g.rotateX(-Math.PI/2);return g},[]);
 const material=useMemo(()=>new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,side:THREE.DoubleSide,depthWrite:false,uniforms:{uTime:{value:0},uPointer:{value:new THREE.Vector2(100,100)}}}),[]);
 useFrame((state,delta)=>{
  target.current.set(state.pointer.x*15,state.pointer.y*9);
  pointer.current.lerp(target.current,Math.min(delta*1.8,1));
  if(ref.current){ref.current.uniforms.uTime.value=state.clock.elapsedTime;ref.current.uniforms.uPointer.value.set(pointer.current.x,pointer.current.y)}
 });
 return <mesh geometry={geometry} rotation={[-.19,0,0]} position={[0,-2.5,-7]}><primitive object={material} ref={ref} attach="material"/><lineSegments><wireframeGeometry args={[geometry]}/><lineBasicMaterial color="#5b8d88" transparent opacity={.43}/></lineSegments></mesh>;
}
export default function Terrain(){return <div className="terrain" aria-hidden="true"><Canvas dpr={[1,1.5]} camera={{position:[0,5,15],fov:55}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}}><fog attach="fog" args={['#080a0b',13,32]}/><Mesh/></Canvas></div>}
