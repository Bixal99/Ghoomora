"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

export function HeroScene() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!host.current || !canvas.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: false }); } catch { return; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.z = 12;
    const points = new Float32Array(300);
    for (let index = 0; index < points.length; index += 3) {
      points[index] = (Math.random() - .5) * 20;
      points[index + 1] = Math.random() * 8 - 1;
      points[index + 2] = Math.random() * 8 - 5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffe4a6, size: .035, transparent: true, opacity: .7 }));
    scene.add(particles);
    let frame = 0;
    const resize = () => {
      if (!host.current) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(host.current.clientWidth, host.current.clientHeight, false);
      camera.aspect = host.current.clientWidth / host.current.clientHeight;
      camera.updateProjectionMatrix();
    };
    const render = () => { particles.rotation.y += .00035; renderer.render(scene, camera); frame = requestAnimationFrame(render); };
    resize(); render();
    window.addEventListener("resize", resize);
    const layers = host.current.querySelectorAll("[data-depth]");
    const move = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - .5;
      const y = event.clientY / window.innerHeight - .5;
      layers.forEach((layer) => {
        const depth = Number((layer as HTMLElement).dataset.depth ?? 1);
        gsap.to(layer, { x: x * depth * 18, y: y * depth * 8, duration: 1.3, ease: "power3.out" });
      });
    };
    window.addEventListener("pointermove", move);
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? render() : cancelAnimationFrame(frame));
    observer.observe(host.current);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); geometry.dispose(); renderer.dispose(); };
  }, []);

  return (
    <div ref={host} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvas} className="absolute inset-0 size-full opacity-80" />
      <div data-depth="1" className="absolute inset-x-[-8%] bottom-[-7%] h-[56%] bg-[#244f43] opacity-70 [clip-path:polygon(0_72%,10%_42%,18%_65%,31%_24%,42%_62%,55%_35%,66%_58%,78%_18%,90%_56%,100%_38%,100%_100%,0_100%)]" />
      <div data-depth="2" className="absolute inset-x-[-8%] bottom-[-10%] h-[47%] bg-[#173f35] [clip-path:polygon(0_67%,13%_31%,24%_71%,38%_18%,52%_69%,65%_28%,76%_63%,88%_22%,100%_58%,100%_100%,0_100%)]" />
      <div data-depth="3" className="absolute inset-x-[-8%] bottom-[-13%] h-[35%] bg-[#0e2b24] [clip-path:polygon(0_52%,15%_25%,27%_66%,43%_10%,57%_62%,72%_20%,84%_66%,100%_30%,100%_100%,0_100%)]" />
      <div data-depth="1" className="absolute left-[13%] top-[19%] h-10 w-44 rounded-full bg-white/15 blur-2xl" />
      <div data-depth="2" className="absolute right-[9%] top-[27%] h-14 w-60 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}
