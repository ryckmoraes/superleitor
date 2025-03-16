
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AudioSphereProps {
  audioData: Uint8Array | null;
  isRecording: boolean;
}

const AudioSphere = ({ audioData, isRecording }: AudioSphereProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: false
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 0); // Completely transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add point light in center
    const pointLight = new THREE.PointLight(0x0088ff, 1, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Create sphere geometry with high detail
    const geometry = new THREE.IcosahedronGeometry(1, 5);
    
    // Create material with nice shader effect
    const material = new THREE.MeshPhongMaterial({
      color: 0x0066ff,
      shininess: 100,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    
    // Create mesh
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Adiciona partículas ao redor da esfera para efeito visual
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Distribui partículas em uma esfera maior
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Material para as partículas - mais transparente e brilhante
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    // Cria e adiciona o sistema de partículas
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Enhanced animation function
    const animate = () => {
      if (!sphereRef.current || !particlesRef.current) return;
      
      // More dynamic rotation when not recording
      if (!isRecording) {
        const time = Date.now() * 0.001;
        
        // More dynamic rotation
        sphereRef.current.rotation.x += 0.004;
        sphereRef.current.rotation.y += 0.003;
        sphereRef.current.rotation.z += 0.001;
        
        // Enhanced breathing effect when not recording
        const scale = 1 + Math.sin(time) * 0.08;
        sphereRef.current.scale.set(scale, scale, scale);
        
        // Rotate particles in opposite direction with slight variation
        particlesRef.current.rotation.x -= 0.002;
        particlesRef.current.rotation.y -= 0.001;
        particlesRef.current.rotation.z -= 0.0005;
        
        // Pulse the particles size
        if (particlesRef.current.material instanceof THREE.PointsMaterial) {
          particlesRef.current.material.size = 0.05 + Math.sin(time * 1.5) * 0.02;
        }
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [isRecording]);

  // Update sphere based on audio data with enhanced effects
  useEffect(() => {
    if (!audioData || !sphereRef.current || !particlesRef.current || !isRecording) return;

    const positions = sphereRef.current.geometry.attributes.position;
    const particlePositions = particlesRef.current.geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Calculate average volume level and frequency distribution
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i];
    }
    const avgVolume = sum / audioData.length / 255;
    
    // Use frequency data to distort sphere
    for (let i = 0; i < positions.count; i++) {
      // Get current vertex
      vertex.fromBufferAttribute(positions, i);
      vertex.normalize();
      
      // Calculate distortion from audio data
      // Use different frequency bands for a more interesting effect
      const freqIndex = Math.min(Math.floor(i / positions.count * audioData.length), audioData.length - 1);
      const freqValue = audioData[freqIndex] / 255;
      
      // Apply distortion with a base size plus audio reactivity
      const distortion = 1 + freqValue * 0.5 + avgVolume * 0.5;
      vertex.multiplyScalar(distortion);
      
      // Update position
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // Update particles based on audio with enhanced effects
    for (let i = 0; i < particlePositions.count; i++) {
      // Get current particle position
      vertex.fromBufferAttribute(particlePositions, i);
      
      // Normalize to get direction from center
      const direction = vertex.clone().normalize();
      
      // Calculate distortion based on audio frequency and average volume
      const freqIndex = Math.min(Math.floor(i / particlePositions.count * audioData.length), audioData.length - 1);
      const freqValue = audioData[freqIndex] / 255;
      
      // Calculate new distance from center with more variation
      const baseDistance = vertex.length();
      const newDistance = baseDistance + freqValue * 0.7 + Math.sin(i * 0.1) * 0.1;
      
      // Set new position
      vertex.copy(direction.multiplyScalar(newDistance));
      particlePositions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // Update material color based on volume with more vibrant colors
    if (sphereRef.current.material instanceof THREE.MeshPhongMaterial) {
      // Shift color from blue to purple based on volume
      const hue = 0.6 - avgVolume * 0.15;
      sphereRef.current.material.color.setHSL(hue, 0.9, 0.55);
      sphereRef.current.material.opacity = 0.7 + avgVolume * 0.3;
      
      // Update particles with complementary colors
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.color.setHSL((hue + 0.1) % 1, 0.8, 0.7);
        particlesRef.current.material.size = 0.05 + avgVolume * 0.15;
      }
    }
    
    // Flag the geometry as needing update
    positions.needsUpdate = true;
    particlePositions.needsUpdate = true;
    
  }, [audioData, isRecording]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default AudioSphere;
