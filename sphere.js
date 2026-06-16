// Digital Vistara - Interactive 3D Sphere using Three.js

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-3d-container');
  if (!container) return;

  // Sizes
  let width = container.clientWidth;
  let height = container.clientHeight || 500;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.z = 7;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group to contain everything for mouse parallax
  const group = new THREE.Group();
  scene.add(group);

  // Helper: Create a glowing circle canvas for particles
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Gradient circular brush
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(216, 200, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.2)');
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
  }

  // Helper: Create an icon canvas sprite texture
  function createIconTexture(label, isDarkTheme) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw glassmorphic circle background
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fillStyle = isDarkTheme ? 'rgba(15, 15, 26, 0.65)' : 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    // Border
    ctx.lineWidth = 4;
    const borderGrad = ctx.createLinearGradient(0, 0, 128, 128);
    borderGrad.addColorStop(0, '#A78BFA'); // Soft Purple
    borderGrad.addColorStop(1, '#F5D7FF'); // Soft Pink
    ctx.strokeStyle = borderGrad;
    ctx.stroke();

    // Shadow glow
    ctx.shadowColor = '#B9A7FF';
    ctx.shadowBlur = 10;

    // Draw text symbol
    ctx.fillStyle = isDarkTheme ? '#F3F4F6' : '#1F1B2C';
    ctx.font = 'bold 24px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Customize drawings for each label
    if (label === 'Google') {
      ctx.fillStyle = '#4285F4';
      ctx.font = 'bold 36px Outfit';
      ctx.fillText('G', 64, 64);
    } else if (label === 'Meta') {
      // Draw meta infinity symbol
      ctx.strokeStyle = '#0078FF';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Simple infinity loop
      ctx.moveTo(35, 64);
      ctx.bezierCurveTo(35, 45, 55, 45, 64, 64);
      ctx.bezierCurveTo(73, 83, 93, 83, 93, 64);
      ctx.bezierCurveTo(93, 45, 73, 45, 64, 64);
      ctx.bezierCurveTo(55, 83, 35, 83, 35, 64);
      ctx.stroke();
    } else if (label === 'SEO') {
      ctx.fillText('SEO', 64, 64);
    } else if (label === 'Web') {
      ctx.font = '32px Outfit';
      ctx.fillText('</>', 64, 64);
    } else if (label === 'API') {
      ctx.fillText('API', 64, 64);
    }

    return new THREE.CanvasTexture(canvas);
  }

  // Particle Sphere
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  const radius = 2.2;
  const color1 = new THREE.Color('#A78BFA'); // Soft Purple
  const color2 = new THREE.Color('#F5D7FF'); // Soft Pink
  const tempColor = new THREE.Color();

  for (let i = 0; i < particleCount; i++) {
    // Math for uniform sphere points
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    // Add slight noise to radius for cloud effect
    const r = radius * (0.85 + Math.random() * 0.3);
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Lerp colors between Purple and Pink
    tempColor.copy(color1).lerp(color2, Math.random());
    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.12,
    map: createParticleTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  const particleSphere = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particleSphere);

  // Orbiting Neon Rings
  const rings = [];
  const ringParams = [
    { radius: 2.8, color: '#A78BFA', rotX: Math.PI / 2.5, rotY: 0.2, speed: 0.003 },
    { radius: 3.2, color: '#EC4899', rotX: -Math.PI / 3, rotY: -0.4, speed: -0.002 },
    { radius: 3.5, color: '#B9A7FF', rotX: Math.PI / 4, rotY: Math.PI / 6, speed: 0.001 }
  ];

  ringParams.forEach(param => {
    // Generate a smooth circle line
    const ringGeometry = new THREE.BufferGeometry();
    const ringPoints = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * param.radius, Math.sin(theta) * param.radius, 0));
    }
    ringGeometry.setFromPoints(ringPoints);

    const ringMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(param.color),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    const ring = new THREE.Line(ringGeometry, ringMaterial);
    ring.rotation.x = param.rotX;
    ring.rotation.y = param.rotY;
    group.add(ring);
    
    rings.push({
      mesh: ring,
      speed: param.speed
    });
  });

  // Floating Icons (Google, Meta, SEO, Web, API)
  const isDark = document.documentElement.classList.contains('dark');
  const labels = ['Google', 'Meta', 'SEO', 'Web', 'API'];
  const iconSprites = [];

  labels.forEach((label, idx) => {
    const texture = createIconTexture(label, isDark);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      depthTest: true
    });
    const sprite = new THREE.Sprite(material);
    
    // Initial size
    sprite.scale.set(0.7, 0.7, 1);
    
    // Distribute sprites around the outer shell of the sphere
    const phi = Math.acos(-1 + (2 * idx) / labels.length);
    const theta = Math.sqrt(labels.length * Math.PI) * phi;
    const distance = 3.8; // Floating further out
    
    sprite.position.x = distance * Math.sin(phi) * Math.cos(theta);
    sprite.position.y = distance * Math.sin(phi) * Math.sin(theta);
    sprite.position.z = distance * Math.cos(phi);
    
    // Add custom properties for orbit physics
    sprite.userData = {
      phi: phi,
      theta: theta,
      orbitSpeed: 0.003 + Math.random() * 0.003,
      distance: distance,
      bobOffset: Math.random() * Math.PI * 2,
      bobSpeed: 1 + Math.random() * 2
    };

    group.add(sprite);
    iconSprites.push(sprite);
  });

  // Mouse Parallax movement variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    // Normalized device coordinates (-1 to 1)
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
  });

  // Listen to theme changes to refresh icon sprites
  const themeObserver = new MutationObserver(() => {
    const isNowDark = document.documentElement.classList.contains('dark');
    iconSprites.forEach((sprite, idx) => {
      // Re-create textures matching theme colors
      const newTexture = createIconTexture(labels[idx], isNowDark);
      sprite.material.map.dispose();
      sprite.material.map = newTexture;
      sprite.material.needsUpdate = true;
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Animation Loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotate main particle sphere
    particleSphere.rotation.y = elapsedTime * 0.05;
    particleSphere.rotation.x = elapsedTime * 0.02;

    // Rotate rings
    rings.forEach(ring => {
      ring.mesh.rotation.z += ring.speed;
    });

    // Orbit and bob icon sprites
    iconSprites.forEach(sprite => {
      const data = sprite.userData;
      
      // Orbit around Y axis
      data.theta += data.orbitSpeed;
      
      // Simple bobbing effect
      const bob = Math.sin(elapsedTime * data.bobSpeed + data.bobOffset) * 0.15;
      const currentDist = data.distance + bob;

      sprite.position.x = currentDist * Math.sin(data.phi) * Math.cos(data.theta);
      sprite.position.y = currentDist * Math.sin(data.phi) * Math.sin(data.theta);
      sprite.position.z = currentDist * Math.cos(data.phi);
    });

    // Smooth camera target rotation (mouse parallax)
    group.rotation.y += (targetX - group.rotation.y) * 0.05;
    group.rotation.x += (targetY - group.rotation.x) * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight || 500;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
});
