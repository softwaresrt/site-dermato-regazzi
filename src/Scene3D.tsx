import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, MeshTransmissionMaterial, PerformanceMonitor, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from './store';

const ScanSkin = shaderMaterial(
  { uTime: 0, uAccent: new THREE.Color('#d6a88d') },
  `varying vec3 vNormalV; varying vec3 vPositionV;
   void main(){vNormalV=normalize(normalMatrix*normal); vec4 viewPos=modelViewMatrix*vec4(position,1.); vPositionV=viewPos.xyz; gl_Position=projectionMatrix*viewPos;}`,
  `uniform float uTime; uniform vec3 uAccent; varying vec3 vNormalV; varying vec3 vPositionV;
   void main(){vec3 normal=normalize(vNormalV); float fresnel=pow(1.-abs(dot(normal,normalize(-vPositionV))),2.2);
   float diffuse=0.77+0.23*max(dot(normal,normalize(vec3(-0.5,0.8,1.0))),0.);
   float scan=pow(max(0.,1.-abs(mod(vPositionV.y*2.8+uTime*.47,3.5)-1.75)),11.);
   vec3 pearl=mix(vec3(.79,.70,.64),vec3(.94,.88,.79),diffuse);
   pearl+=uAccent*(fresnel*.28+scan*.16);
   float tiny=sin(vPositionV.y*160.)*.005;
   gl_FragColor=vec4(pearl+tiny,1.);}`,
);
extend({ ScanSkin });

function useScreenIsMobile() {
  const { size } = useThree();
  return size.width < 760;
}

function FaceBust() {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const scene = useExperience((s) => s.scene);
  const faceRotation = useExperience((s) => s.faceRotation);
  const isMobile = useScreenIsMobile();
  useFrame((state, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, faceRotation * 0.7 + Math.sin(state.clock.elapsedTime * .28) * .08, 2.3, delta);
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * .38) * .018;
    }
  });
  if (scene !== 'face') return null;
  const skin = <meshPhysicalMaterial color="#dbc5b5" metalness={0.09} roughness={0.37} clearcoat={0.45} />;
  return (
    <group position={[isMobile ? 0 : -2.7, isMobile ? .75 : -.08, 0]} scale={isMobile ? .91 : 1.4}>
      <group ref={group}>
        <mesh position={[0,-2.0,0]} scale={[1.3,.72,.62]}><sphereGeometry args={[1,48,32]} /><meshPhysicalMaterial color="#b59c8c" roughness={.45} /></mesh>
        <mesh position={[0,-1.12,0]} scale={[.38,.62,.38]}><cylinderGeometry args={[.46,.55,1,32]} />{skin}</mesh>
        <mesh position={[0,.25,0]} scale={[.81,1.17,.72]}>
          <sphereGeometry args={[1,96,64]} />
          {/* Custom GLSL scanner / fresnel skin material */}
          {/* @ts-expect-error shaderMaterial registered via extend */}
          <scanSkin ref={mat} transparent={false} />
        </mesh>
        <mesh position={[0,-.69,.20]} scale={[.54,.45,.57]}><sphereGeometry args={[1,48,32]} />{skin}</mesh>
        <mesh position={[0,.03,.722]} rotation={[.1,0,0]} scale={[.13,.34,.23]}><sphereGeometry args={[1,32,32]} />{skin}</mesh>
        <mesh position={[0,-.20,.91]} rotation={[-.15,0,0]} scale={[.17,.10,.10]}><sphereGeometry args={[1,32,16]} />{skin}</mesh>
        {[-1,1].map((dir) => <group key={dir}>
          <mesh position={[dir*.72,.08,.04]} scale={[.17,.28,.17]}><sphereGeometry args={[1,32,16]} />{skin}</mesh>
          <mesh position={[dir*.315,.3,.652]} scale={[.20,.042,.055]} rotation={[0,0,dir*.12]}><sphereGeometry args={[1,32,16]} /><meshStandardMaterial color="#5c4740" roughness={.68}/></mesh>
          <mesh position={[dir*.31,.20,.675]} scale={[.19,.052,.033]}><sphereGeometry args={[1,32,16]} /><meshStandardMaterial color="#fff0e2" roughness={.4}/></mesh>
          <mesh position={[dir*.31,.205,.706]} scale={[.050,.052,.025]}><sphereGeometry args={[1,24,16]} /><meshStandardMaterial color="#705c54" roughness={.38}/></mesh>
        </group>)}
        <mesh position={[0,-.46,.696]} scale={[.21,.035,.044]}><sphereGeometry args={[1,32,16]} /><meshStandardMaterial color="#ab847b" roughness={.52}/></mesh>
        <mesh position={[0,-.49,.692]} scale={[.16,.045,.047]}><sphereGeometry args={[1,32,16]} /><meshStandardMaterial color="#c49b90" roughness={.49}/></mesh>
        <mesh position={[0,1.28,-.1]} scale={[.66,.20,.53]}><sphereGeometry args={[1,48,24]} /><meshStandardMaterial color="#9f887b" metalness={.16} roughness={.42}/></mesh>
      </group>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2.72,0]}><torusGeometry args={[1.55,.003,3,180]}/><meshBasicMaterial color="#caa68d" transparent opacity={.4}/></mesh>
      {[1.6,1.95,2.3].map((radius)=> <mesh key={radius} rotation={[Math.PI/2,0,0]} position={[0,0,-1.25]}><torusGeometry args={[radius,.002,3,160]} /><meshBasicMaterial color="#d6ae91" transparent opacity={.13}/></mesh>)}
    </group>
  );
}

function PearlDrop() {
  const scene = useExperience((s) => s.scene);
  const progress = useExperience((s) => s.careProgress);
  const group = useRef<THREE.Group>(null);
  const isMobile = useScreenIsMobile();
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.25,96,64);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for(let i=0;i<pos.count;i++) {
      const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
      const taper=1-(Math.max(y,0)/1.45)*.28;
      pos.setXYZ(i, x*taper, y+(y>0 ? Math.pow(y/1.25,3)*.30 : 0), z*taper);
    }
    geo.computeVertexNormals();
    return geo;
  },[]);
  useFrame(({ clock },delta)=>{
    if (group.current) {
      group.current.rotation.y+=delta*.16;
      group.current.rotation.z=THREE.MathUtils.damp(group.current.rotation.z,Math.sin(clock.elapsedTime*.30)*.15+progress*.06,1,delta);
      const scale=1+Math.sin(clock.elapsedTime*1.3)*.023;
      group.current.scale.setScalar(scale);
    }
  });
  if(scene!=='care')return null;
  return <group position={[isMobile ? 0 : 2.65,isMobile ? -.8 : -.05,0]} ref={group}>
    <mesh geometry={geometry} scale={[1.22,1.3,.95]}>
      <meshPhysicalMaterial color={new THREE.Color().setHSL(.062+progress*.035,.28,.81)} metalness={.1} roughness={.09} clearcoat={1} clearcoatRoughness={.06} iridescence={.6} iridescenceIOR={1.3} />
    </mesh>
    <mesh scale={[1.65,1.72,1.42]}><sphereGeometry args={[1,40,40]} /><meshBasicMaterial color="#eacbb7" transparent opacity={.032} depthWrite={false} /></mesh>
    <pointLight position={[-2,2,3]} color="#f9ead8" intensity={24}/>
  </group>;
}

function PhotoPoints() {
  const scene = useExperience((s) => s.scene);
  const cursor = useExperience((s)=>s.pointer);
  const morph = useExperience((s)=>s.heroMorph);
  const [geometry,setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const shader = useRef<THREE.ShaderMaterial>(null);
  const isMobile=useScreenIsMobile();
  useEffect(()=>{
    const img=new Image(); img.src='./media/paula-beatriz-regazzi.jpg';
    img.onload=()=>{
      const width= isMobile?47:74, height=isMobile?57:92;
      const c=document.createElement('canvas'); c.width=width;c.height=height;
      const ctx=c.getContext('2d'); if(!ctx)return;
      ctx.drawImage(img,0,0,width,height);
      const {data}=ctx.getImageData(0,0,width,height);
      const points:number[]=[],colors:number[]=[],scatter:number[]=[], targets:number[]=[];
      const letters=document.createElement('canvas'); letters.width=220;letters.height=66;
      const wordCtx=letters.getContext('2d');
      const targetCoords:[number,number][]=[];
      if(wordCtx){wordCtx.clearRect(0,0,220,66);wordCtx.fillStyle='#fff';wordCtx.font='bold 33px Arial';wordCtx.textAlign='center';wordCtx.fillText('ESSÊNCIA',110,40);
       const pixels=wordCtx.getImageData(0,0,220,66).data;
       for(let ty=0;ty<66;ty+=2)for(let tx=0;tx<220;tx+=2){if(pixels[(ty*220+tx)*4+3]>100)targetCoords.push([tx/220*4.3-2.15,(.5-ty/66)*1.3]);}
      }
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const i=(y*width+x)*4,light=(data[i]+data[i+1]+data[i+2])/765;
        if(light<.19||Math.random()>.73)continue;
        points.push((x/width-.5)*2.95,-(y/height-.5)*3.8,(light-.5)*.6);
        colors.push(data[i]/255,data[i+1]/255,data[i+2]/255);
        scatter.push((Math.random()-.5)*2,(Math.random()-.5)*2,(Math.random()-.5)*2);
        const goal=targetCoords.length?targetCoords[Math.floor(Math.random()*targetCoords.length)]:[0,0];
        targets.push(goal[0],goal[1],(Math.random()-.5)*.1);
      }
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
      g.setAttribute('aColor',new THREE.Float32BufferAttribute(colors,3));
      g.setAttribute('aScatter',new THREE.Float32BufferAttribute(scatter,3));
      g.setAttribute('aTarget',new THREE.Float32BufferAttribute(targets,3));
      setGeometry(g);
    };
  },[isMobile]);
  useFrame(({clock})=>{
    if(shader.current){shader.current.uniforms.uTime.value=clock.elapsedTime;shader.current.uniforms.uMouse.value.set(cursor[0],cursor[1]);shader.current.uniforms.uMorph.value=morph;}
  });
  if(scene!=='hero'||!geometry)return null;
  return <points geometry={geometry} position={[isMobile?1.18:2.73,isMobile?-.85:-.25,-.1]} scale={isMobile?.55:.88}>
    <shaderMaterial ref={shader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{uTime:{value:0},uMouse:{value:new THREE.Vector2(0,0)},uMorph:{value:0}}}
      vertexShader={`attribute vec3 aColor;attribute vec3 aScatter;attribute vec3 aTarget;varying vec3 vColor;uniform float uTime;uniform vec2 uMouse;uniform float uMorph;
      void main(){vColor=aColor;vec3 p=position;float d=length(p.xy-uMouse*1.3);float repel=exp(-d*d*1.6);p.xy+=(normalize(p.xy-uMouse*1.3+.001)*repel*.27);p+=aScatter*(.03+sin(uTime*.7+position.x*2.)*.025);p=mix(p,aTarget,smoothstep(0.,1.,uMorph));vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_PointSize=min(5.,2.2*(13./-mvPosition.z));gl_Position=projectionMatrix*mvPosition;}`}
      fragmentShader={`varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);float alpha=1.-smoothstep(.2,.5,d);gl_FragColor=vec4(mix(vColor,vec3(1.,.85,.75),.23),alpha*.56);}`} />
  </points>;
}

function RoomJourney() {
  const scene = useExperience((s)=>s.scene);
  const progress = useExperience((s)=>s.journeyProgress);
  const group=useRef<THREE.Group>(null);
  const isMobile=useScreenIsMobile();
  useFrame((_,delta)=>{
    if(group.current){
      group.current.position.z=THREE.MathUtils.damp(group.current.position.z,progress*8.4,2,delta);
      group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,Math.sin(progress*Math.PI*2)*.065,2,delta);
    }
  });
  if(scene!=='journey')return null;
  return <group position={[0,-.9,0]} scale={isMobile?.84:1.12} ref={group}>
    <mesh position={[0,-2,-3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[10,30]}/><meshStandardMaterial color="#948574" roughness={.6}/></mesh>
    <mesh position={[0,2.75,-3]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[10,30]}/><meshStandardMaterial color="#c9b9a5" roughness={.83}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*3.15,.2,-3]}><boxGeometry args={[.1,5.2,28]}/><meshStandardMaterial color="#aa9c8c" side={THREE.DoubleSide}/></mesh>
      {Array.from({length:6},(_,i)=><group key={i} position={[side*3.1,0,-i*3]}>
        <mesh position={[0,.5,0]}><boxGeometry args={[.13,3.4,.045]}/><meshPhysicalMaterial color="#e4d6c4" metalness={.06} roughness={.3}/></mesh>
        <mesh position={[side*.035,2.05,-.35]}><boxGeometry args={[.21,.055,2.6]}/><meshStandardMaterial color="#b49475" metalness={.25}/></mesh>
        <pointLight position={[-side*1.2,1.9,-.6]} color="#f2cfa9" intensity={7} distance={5}/>
      </group>)}
    </group>)}
    {Array.from({length:5},(_,i)=><group key={i} position={[0,-1.25,-i*3.1]}>
      <mesh position={[-1.75,0,-.15]}><boxGeometry args={[1.9,.40,.82]}/><meshStandardMaterial color={i%2===0?'#d5bbaa':'#b0a298'} roughness={.78}/></mesh>
      <mesh position={[-1.75,-.40,-.15]}><boxGeometry args={[1.7,.75,.65]}/><meshStandardMaterial color="#8a766a" roughness={.8}/></mesh>
      <mesh position={[1.18,-.33,-.45]}><cylinderGeometry args={[.57,.43,.12,48]}/><meshStandardMaterial color="#b8a997" roughness={.35}/></mesh>
      <mesh position={[1.18,-.73,-.45]}><cylinderGeometry args={[.07,.12,.7,20]}/><meshStandardMaterial color="#bd9e83" metalness={.62} roughness={.24}/></mesh>
      <mesh position={[2.3,-.5,-.8]}><cylinderGeometry args={[.1,.12,1.5,12]}/><meshStandardMaterial color="#697769" roughness={.83}/></mesh>
      <mesh position={[2.3,.55,-.8]}><sphereGeometry args={[.45,16,12]}/><meshStandardMaterial color="#96a48c" roughness={.8}/></mesh>
    </group>)}
  </group>;
}

function Rig(){
  const scene=useExperience((s)=>s.scene);
  const {camera}=useThree();
  useFrame((_,delta)=>{
    const target=scene==='journey'?[0,.1,7.6]:[0,0,10];
    camera.position.x=THREE.MathUtils.damp(camera.position.x,target[0],2,delta);
    camera.position.y=THREE.MathUtils.damp(camera.position.y,target[1],2,delta);
    camera.position.z=THREE.MathUtils.damp(camera.position.z,target[2],2,delta);
    camera.lookAt(0,0,0);
  });return null;
}

export default function Scene3D(){
  const scene=useExperience((s)=>s.scene);
  const [enabled,setEnabled]=useState(true);
  const [dpr,setDpr]=useState(1.5);
  useEffect(()=>{setEnabled(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);},[]);
  if(!enabled)return null;
  return <div className={`global-webgl scene-${scene}`} aria-hidden="true">
    <Canvas camera={{position:[0,0,10],fov:38}} dpr={[1,dpr]} gl={{alpha:true,antialias: true,powerPreference:'high-performance'}}>
      <PerformanceMonitor onDecline={()=>setDpr(1)} onIncline={()=>setDpr(1.7)} />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={2.25}/>
      <directionalLight position={[-3,5,5]} intensity={3.6} color="#ffe9cf"/>
      <directionalLight position={[4,0,3]} intensity={1.5} color="#d4a589"/>
      <Suspense fallback={null}>
        <PhotoPoints />
        <FaceBust />
        <PearlDrop />
        <RoomJourney />
      </Suspense>
      <Rig />
    </Canvas>
  </div>;
}
