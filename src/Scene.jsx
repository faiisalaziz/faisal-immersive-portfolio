import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene({ highGraphics = true, progress = 0, reducedMotion = false }) {
  const mount = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const progressRef = useRef(progress);
  useEffect(()=>{progressRef.current=progress},[progress]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111d29');
    scene.fog = new THREE.Fog('#111d29', 12, 34);
    const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(7.6, 5.6, 10.5);
    const renderer = new THREE.WebGLRenderer({ antialias: highGraphics, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, highGraphics ? 1.5 : 1));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = highGraphics;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight('#9edfff', '#10131b', 1.8); scene.add(hemi);
    const key = new THREE.DirectionalLight('#d8f6ff', 3.2); key.position.set(3, 9, 5); key.castShadow = highGraphics; scene.add(key);
    const cyan = new THREE.PointLight('#37fff0', 16, 10); cyan.position.set(-1.1, 3.1, -1.2); scene.add(cyan);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 340), new THREE.MeshStandardMaterial({ color: '#172432', roughness: .82, metalness: .15 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(300, 180, '#8197a8', '#405367'); grid.position.set(0, 0.012, -130); grid.material.transparent = true; grid.material.opacity = .3; scene.add(grid);
    // A single continuous corridor carries the camera beyond the workstation through the later environments.
    const corridor = new THREE.Group(); scene.add(corridor);
    const ringMat = new THREE.MeshStandardMaterial({color:'#21445a',metalness:.7,roughness:.28,emissive:'#087e8c',emissiveIntensity:.6,transparent:true,opacity:.48});
    for(let i=0;i<9;i++){
      const z=-14-i*17, scale=1+(i%3)*.26;
      const ring=new THREE.Mesh(new THREE.TorusGeometry(5.2*scale,.018,5,100),ringMat); ring.position.set((i%2?1:-1)*.6,3.2,z); ring.rotation.x=Math.PI/2; corridor.add(ring);
      const pillarMat=new THREE.MeshStandardMaterial({color:'#142a38',metalness:.55,roughness:.38,emissive:'#0a6471',emissiveIntensity:.4});
      for(const side of [-1,1]){const pillar=new THREE.Mesh(new THREE.BoxGeometry(.055,6.5,.08),pillarMat);pillar.position.set(side*(5.7*scale),2.4,z);corridor.add(pillar)}
    }
    const beacons=[];
    for(let i=0;i<40;i++){const g=new THREE.IcosahedronGeometry(.045+(i%3)*.02,1);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%4===0?'#78fff0':'#6da4c3',transparent:true,opacity:.65}));m.position.set((Math.random()-.5)*15,Math.random()*8,-Math.random()*165);scene.add(m);beacons.push(m)}

    const mat = (color, metalness=.25, roughness=.5, emissive=null) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...(emissive ? { emissive, emissiveIntensity: 1.8 } : {}) });
    const dark = mat('#10151b', .75, .3), black = mat('#070b10', .35, .32), metal = mat('#334657', .8, .28), cyanMat = mat('#b9ffff', .1, .18, '#20fff0');
    const addBox = (w,h,d,material,x,y,z, parent=scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow = highGraphics; m.receiveShadow = true; parent.add(m); return m; };
    const desk = new THREE.Group(); scene.add(desk);
    addBox(5.4,.22,2.5,dark,0,1.55,0,desk);
    addBox(.22,1.55,2.35,black,-2.35,.76,0,desk);
    addBox(.22,1.55,2.35,black,2.35,.76,0,desk);
    addBox(5.3,.08,2.45,metal,0,1.68,0,desk);
    // Monitor, stand and luminous screen
    addBox(2.35,1.48,.13,black,-.55,3.0,-.72,desk);
    addBox(2.18,1.31,.025,cyanMat,-.55,3.02,-.635,desk);
    addBox(.16,.75,.18,metal,-.55,2.35,-.72,desk);
    addBox(.9,.09,.55,black,-.55,1.98,-.72,desk);
    // Keyboard and mouse
    addBox(1.45,.07,.48,black,-.25,1.83,.35,desk);
    addBox(.28,.08,.42,metal,1.0,1.83,.3,desk);
    // PC tower
    addBox(.95,2.25,.95,black,1.85,2.75,-.35,desk);
    addBox(.78,1.95,.025,metal,1.85,2.77,.14,desk);
    const fanMat = new THREE.MeshStandardMaterial({ color:'#45fff0', emissive:'#20fff0', emissiveIntensity:2 });
    for(let i=0;i<3;i++){ const fan=new THREE.Mesh(new THREE.TorusGeometry(.19,.025,8,24),fanMat); fan.position.set(1.85,3.42-i*.55,.18); scene.add(fan); }
    // Chair and low-poly seated developer silhouette
    const chair = new THREE.Group(); scene.add(chair);
    addBox(1.25,.16,1.05,black,1.15,1.12,2.0,chair);
    addBox(1.2,1.35,.16,black,1.15,1.85,2.48,chair);
    const cyl = (r1,r2,h,material,x,y,z,rx=0,rz=0) => { const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,7),material); m.position.set(x,y,z); m.rotation.x=rx; m.rotation.z=rz; m.castShadow=highGraphics; chair.add(m); return m; };
    cyl(.28,.34,.28,metal,1.15,.92,2.0);
    for(let i=0;i<5;i++){ const a=i*Math.PI*2/5; const leg=addBox(.12,.12,1.0,metal,1.15+Math.cos(a)*.35,.42,2+Math.sin(a)*.35,chair); leg.rotation.y=-a; }
    // torso/head/arms as deliberately stylised low-poly figure
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(.35,.48,1.15,6),dark); torso.position.set(.95,2.05,1.65); torso.rotation.x=-.2; torso.castShadow=true; chair.add(torso);
    const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.38,1),mat('#090e14',.3,.4)); head.position.set(.85,2.92,1.25); head.castShadow=true; chair.add(head);
    const arm1=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,1.15,6),dark); arm1.position.set(.35,2.0,.8); arm1.rotation.z=-1.05; arm1.rotation.x=.3; chair.add(arm1);
    const arm2=arm1.clone(); arm2.position.x=1.25; chair.add(arm2);
    // Small glowing desk object
    const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),new THREE.MeshStandardMaterial({color:'#baffff',emissive:'#38fff0',emissiveIntensity:3})); orb.position.set(-1.8,1.9,.25); scene.add(orb);
    const glow=new THREE.PointLight('#42fff0',5,3); glow.position.copy(orb.position); scene.add(glow);
    // floating dust
    const particles = new THREE.BufferGeometry(); const positions=[]; for(let i=0;i<260;i++) positions.push((Math.random()-.5)*18,Math.random()*7,(Math.random()-.5)*16);
    particles.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); const stars=new THREE.Points(particles,new THREE.PointsMaterial({color:'#a9e9f5',size:.018,transparent:true,opacity:.5})); scene.add(stars);

    let raf; const onMove=e=>{ if(reducedMotion)return; pointer.current.x=(e.clientX/window.innerWidth-.5); pointer.current.y=(e.clientY/window.innerHeight-.5); };
    window.addEventListener('pointermove',onMove);
    const clock=new THREE.Clock();
    const animate=()=>{ raf=requestAnimationFrame(animate); const t=clock.getElapsedTime(); const p=progressRef.current; const worldZ=-p*118; const x=7.6+pointer.current.x*(1.15-p*.35), y=5.6-p*1.05-pointer.current.y*.55, z=10.5+worldZ; if(reducedMotion){camera.position.set(x,y,z)}else{camera.position.x+=(x-camera.position.x)*.025;camera.position.y+=(y-camera.position.y)*.025;camera.position.z+=(z-camera.position.z)*.025;} const targetX=pointer.current.x*-.55, targetY=1.65-p*.6; camera.lookAt(targetX,targetY,.25+worldZ-p*9); if(!reducedMotion){orb.position.y=1.9+Math.sin(t*1.4)*.07;beacons.forEach((b,i)=>{b.position.y+=Math.sin(t*.55+i)*.0009;b.rotation.y=t*.12});cyan.intensity=highGraphics?14+Math.sin(t*2)*2:8;} renderer.render(scene,camera); };
    animate();
    const resize=()=>{ if(!host) return; camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth,host.clientHeight); };
    window.addEventListener('resize',resize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); window.removeEventListener('pointermove',onMove); renderer.dispose(); host.removeChild(renderer.domElement); scene.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material){ if(Array.isArray(o.material))o.material.forEach(m=>m.dispose()); else o.material.dispose(); } }); };
  },[highGraphics]);
  return <div className="scene" ref={mount} aria-label="Interactive 3D workstation scene" />;
}
