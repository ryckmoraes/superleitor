
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

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

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

    // Animate function
    const animate = () => {
      if (!sphereRef.current) return;
      
      // Subtle rotation when not recording
      if (!isRecording) {
        sphereRef.current.rotation.x += 0.003;
        sphereRef.current.rotation.y += 0.003;
        
        // Subtle breathing effect when not recording
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time) * 0.05;
        sphereRef.current.scale.set(scale, scale, scale);
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

  // Update sphere based on audio data
  useEffect(() => {
    if (!audioData || !sphereRef.current || !isRecording) return;

    const positions = sphereRef.current.geometry.attributes.position;
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
    
    // Update material color based on volume
    if (sphereRef.current.material instanceof THREE.MeshPhongMaterial) {
      // Shift color from blue to purple based on volume
      const hue = 0.6 - avgVolume * 0.1;
      sphereRef.current.material.color.setHSL(hue, 0.8, 0.5);
      sphereRef.current.material.opacity = 0.7 + avgVolume * 0.3;
    }
    
    // Flag the geometry as needing update
    positions.needsUpdate = true;
    
  }, [audioData, isRecording]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default AudioSphere;
