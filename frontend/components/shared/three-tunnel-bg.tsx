'use client';

import * as React from 'react';
import * as THREE from 'three';

export function ThreeTunnelBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let isVisible = true;

    // Helpers
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    // High performance renderer with capped DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060314);
    scene.fog = new THREE.FogExp2(0x060314, 0.025);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 18);

    // Optimized Tunnel Geometry (3,200 points instead of 64,000)
    const particleCount = 3200;
    const tunnelPositions = new Float32Array(particleCount * 3);
    const tunnelColors = new Float32Array(particleCount * 3);
    const tunnelSizes = new Float32Array(particleCount);

    const palette = [
      new THREE.Color('#06b6d4'), // cyan
      new THREE.Color('#8b5cf6'), // purple
      new THREE.Color('#ec4899'), // pink
      new THREE.Color('#3b82f6'), // blue
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.8 + Math.random() * 2.2;
      const angle = (i / particleCount) * Math.PI * 2 * 32 + (Math.random() - 0.5) * 0.4;
      const z = (Math.random() - 0.5) * 70;

      tunnelPositions[i * 3] = Math.cos(angle) * radius;
      tunnelPositions[i * 3 + 1] = Math.sin(angle) * radius;
      tunnelPositions[i * 3 + 2] = z;

      const color = palette[Math.floor(Math.random() * palette.length)];
      tunnelColors[i * 3] = color.r;
      tunnelColors[i * 3 + 1] = color.g;
      tunnelColors[i * 3 + 2] = color.b;

      tunnelSizes[i] = 12.0 + Math.random() * 20.0;
    }

    const tunnelGeo = new THREE.BufferGeometry();
    tunnelGeo.setAttribute('position', new THREE.BufferAttribute(tunnelPositions, 3));
    tunnelGeo.setAttribute('color', new THREE.BufferAttribute(tunnelColors, 3));
    tunnelGeo.setAttribute('size', new THREE.BufferAttribute(tunnelSizes, 1));

    // Custom Glowing Particle Shader (Zero post-processing overhead)
    const tunnelMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: dpr },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uDpr;

        void main() {
          vColor = color;
          vec3 pos = position;

          // Subtle organic warp motion
          pos.x += sin(pos.z * 0.15 + uTime * 0.8) * 0.6;
          pos.y += cos(pos.z * 0.15 + uTime * 0.7) * 0.6;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uDpr * (18.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 1.5, 45.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;

          // Soft glowing radial falloff
          float glow = smoothstep(0.5, 0.0, dist);
          float core = smoothstep(0.2, 0.0, dist) * 0.8;
          vec3 finalColor = vColor + vec3(core);
          gl_FragColor = vec4(finalColor, glow * 0.85);
        }
      `,
    });

    const tunnelPoints = new THREE.Points(tunnelGeo, tunnelMat);
    scene.add(tunnelPoints);

    // Floating Stardust Motes
    const stardustCount = 400;
    const stardustPositions = new Float32Array(stardustCount * 3);
    for (let i = 0; i < stardustCount; i++) {
      stardustPositions[i * 3] = (Math.random() - 0.5) * 30;
      stardustPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      stardustPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const stardustGeo = new THREE.BufferGeometry();
    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPositions, 3));
    const stardustMat = new THREE.PointsMaterial({
      size: 2.5,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const stardust = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardust);

    // Interactive mouse parallax & scroll smoothing
    const mouse = { x: 0, y: 0 };
    const mouseTarget = { x: 0, y: 0 };
    let scrollProgress = 0;
    let scrollSmooth = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = clamp(window.scrollY / maxScroll, 0, 1);
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Ultra-smooth 60 FPS Single-Pass Animation Loop
    let clock = new THREE.Clock();

    function renderLoop() {
      animId = requestAnimationFrame(renderLoop);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation
      mouse.x = lerp(mouse.x, mouseTarget.x, 0.05);
      mouse.y = lerp(mouse.y, mouseTarget.y, 0.05);
      scrollSmooth = lerp(scrollSmooth, scrollProgress, 0.08);

      tunnelMat.uniforms.uTime.value = elapsedTime;

      // Gentle rotation & drift
      tunnelPoints.rotation.z += delta * 0.08;
      stardust.rotation.y += delta * 0.02;

      // Parallax camera positioning
      camera.position.x = mouse.x * 1.5;
      camera.position.y = mouse.y * 1.2;
      camera.position.z = 18 - scrollSmooth * 12;
      camera.lookAt(mouse.x * 0.5, mouse.y * 0.5, 0);

      renderer.render(scene, camera);
    }

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer.dispose();
      tunnelGeo.dispose();
      tunnelMat.dispose();
      stardustGeo.dispose();
      stardustMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#060314]"
    />
  );
}
