// Three.js Galaxy Scene - Phase A
// Immersive 3D universe background with 400k particles

// Galaxy Configuration - Reduced particle count for performance
const GALAXY_CONFIG = {
  count: 8_000,        // Reduced from 400k to 8k for subtle overlay effect
  radius: 6,
  branches: 5,
  spin: 1.0,
  randomness: 0.3,
  randomPower: 3,
  colors: {
    inner: new THREE.Color('#00e5ff'),  // Match theme cyan
    outer: new THREE.Color('#b388ff'),  // Match theme purple
  },
  mobile: {
    count: 3_000,      // Further reduced for mobile
  },
};

// Vertex Shader
const galaxyVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    vColor = aColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Rotation animation
    float angle = atan(modelPosition.x, modelPosition.z);
    float dist = length(modelPosition.xz);
    float angleOffset = (1.0 / dist) * uTime * 0.15;
    modelPosition.x = cos(angle + angleOffset) * dist;
    modelPosition.z = sin(angle + angleOffset) * dist;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projPosition = projectionMatrix * viewPosition;
    gl_Position = projPosition;

    // Particle size attenuation based on camera distance
    gl_PointSize = aSize * uPixelRatio * (1.0 / -viewPosition.z) * 200.0;
  }
`;

// Fragment Shader
const galaxyFragmentShader = `
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

class GalaxyScene {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.galaxy = null;
    this.clock = new THREE.Clock();
    this.isActive = true;
    this.isMobile = false;

    // Bloom post-processing
    this.composer = null;
    this.bloomPass = null;

    this.init();
  }

  init() {
    // Check device capabilities
    this.isMobile = window.matchMedia('(max-width: 768px)').matches ||
                    window.matchMedia('(pointer: coarse)').matches;

    // Setup canvas container
    this.setupCanvas();

    // Setup Three.js scene
    this.setupScene();

    // Create galaxy
    this.createGalaxy();

    // Setup post-processing
    this.setupPostProcessing();

    // Start animation loop
    this.animate();

    // Setup event listeners
    this.setupEvents();

    console.log(`[Three.js] Galaxy initialized (${this.isMobile ? 'mobile' : 'desktop'} mode)`);
  }

  setupCanvas() {
    // Find or create canvas container - positioned above bg image but below content
    let container = document.getElementById('three-canvas-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'three-canvas-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -2;
        pointer-events: none;
        opacity: 0.6;
        mix-blend-mode: screen;
      `;
      document.body.insertBefore(container, document.body.firstChild);
    }
    this.container = container;
  }

  setupScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060810, 0.03);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 5;
    this.camera.position.y = 2;
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x060810, 1);
    this.container.appendChild(this.renderer.domElement);
  }

  createGalaxy() {
    const particleCount = this.isMobile ? GALAXY_CONFIG.mobile.count : GALAXY_CONFIG.count;

    // Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorInside = GALAXY_CONFIG.colors.inner;
    const colorOutside = GALAXY_CONFIG.colors.outer;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position
      const radius = Math.random() * GALAXY_CONFIG.radius;
      const spinAngle = radius * GALAXY_CONFIG.spin;
      const branchAngle = (i % GALAXY_CONFIG.branches) / GALAXY_CONFIG.branches * Math.PI * 2;

      const randomX = Math.pow(Math.random(), GALAXY_CONFIG.randomPower) *
                      (Math.random() < 0.5 ? 1 : -1) * GALAXY_CONFIG.randomness * radius;
      const randomY = Math.pow(Math.random(), GALAXY_CONFIG.randomPower) *
                      (Math.random() < 0.5 ? 1 : -1) * GALAXY_CONFIG.randomness * radius;
      const randomZ = Math.pow(Math.random(), GALAXY_CONFIG.randomPower) *
                      (Math.random() < 0.5 ? 1 : -1) * GALAXY_CONFIG.randomness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color gradient
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / GALAXY_CONFIG.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Size
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Material with custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.galaxy = new THREE.Points(geometry, material);
    this.scene.add(this.galaxy);
  }

  setupPostProcessing() {
    // Skip post-processing on mobile for performance
    if (this.isMobile) return;

    // Import post-processing modules via CDN
    const loader = new THREE.LoadingManager();

    // Use EffectComposer from Three.js examples
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/examples/js/postprocessing/EffectComposer.js';
    script.onload = () => {
      this.loadBloomPass();
    };
    document.head.appendChild(script);
  }

  loadBloomPass() {
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/examples/js/postprocessing/RenderPass.js',
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/examples/js/postprocessing/ShaderPass.js',
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/examples/js/shaders/CopyShader.js',
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/examples/js/shaders/LuminosityHighPassShader.js',
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/examples/js/postprocessing/UnrealBloomPass.js',
    ];

    let loaded = 0;
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loaded++;
        if (loaded === scripts.length) {
          this.initComposer();
        }
      };
      document.head.appendChild(script);
    });
  }

  initComposer() {
    if (typeof THREE.EffectComposer === 'undefined') return;

    this.composer = new THREE.EffectComposer(this.renderer);

    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, // strength
      0.4, // radius
      0.1  // threshold
    );
    this.composer.addPass(this.bloomPass);

    console.log('[Three.js] Post-processing initialized');
  }

  animate() {
    if (!this.isActive) return;

    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Update galaxy rotation
    if (this.galaxy) {
      this.galaxy.material.uniforms.uTime.value = elapsedTime;
      this.galaxy.rotation.y = elapsedTime * 0.05;
    }

    // Render
    if (this.composer && this.bloomPass) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setupEvents() {
    // Resize handler
    window.addEventListener('resize', this.debounce(() => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      if (this.composer) {
        this.composer.setSize(window.innerWidth, window.innerHeight);
      }

      if (this.galaxy) {
        this.galaxy.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
      }
    }, 200));

    // Visibility handling
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive) {
        this.animate();
      }
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Performance tier adjustment
  setPerformanceTier(tier) {
    if (tier === 'LOW') {
      // Disable galaxy on low-end devices
      if (this.galaxy) {
        this.galaxy.visible = false;
      }
      if (this.container) {
        this.container.style.display = 'none';
      }
    }
  }
}

// Neural Mesh Network - Dynamic topology
class NeuralMesh {
  constructor(scene) {
    this.scene = scene;
    this.nodes = [];
    this.edges = [];
    this.maxEdges = 800;
    this.threshold = 1.8;
    this.lineSegments = null;

    this.init();
  }

  init() {
    // Create random nodes
    const nodeCount = 100;
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10,
        vx: 0,
        vy: 0,
        vz: 0,
      });
    }

    // Create line geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxEdges * 2 * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    this.lineSegments = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lineSegments);
  }

  update(time) {
    // Update node positions with Perlin-like noise
    this.nodes.forEach((node, i) => {
      node.x += Math.sin(time * 0.3 + i * 1.7) * 0.002;
      node.y += Math.cos(time * 0.2 + i * 2.3) * 0.002;
      node.z += Math.sin(time * 0.4 + i * 0.9) * 0.001;
    });

    this.rebuildEdges();
  }

  rebuildEdges() {
    const positions = this.lineSegments.geometry.attributes.position.array;
    let edgeIndex = 0;

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        if (edgeIndex >= this.maxEdges * 2) break;

        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dz = this.nodes[i].z - this.nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < this.threshold) {
          const opacity = Math.exp((-dist * dist) / (this.threshold * this.threshold));

          positions[edgeIndex * 3] = this.nodes[i].x;
          positions[edgeIndex * 3 + 1] = this.nodes[i].y;
          positions[edgeIndex * 3 + 2] = this.nodes[i].z;
          edgeIndex++;

          positions[edgeIndex * 3] = this.nodes[j].x;
          positions[edgeIndex * 3 + 1] = this.nodes[j].y;
          positions[edgeIndex * 3 + 2] = this.nodes[j].z;
          edgeIndex++;
        }
      }
    }

    // Clear remaining positions
    for (let i = edgeIndex * 3; i < positions.length; i++) {
      positions[i] = 0;
    }

    this.lineSegments.geometry.attributes.position.needsUpdate = true;
  }
}

// Initialize on DOM ready
let galaxyScene = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check for WebGL support
  if (!window.WebGLRenderingContext) {
    console.log('[Three.js] WebGL not supported, falling back to CSS background');
    return;
  }

  // Initialize galaxy scene
  try {
    galaxyScene = new GalaxyScene();

    // Store globally for access
    window.GalaxyScene = galaxyScene;
  } catch (error) {
    console.error('[Three.js] Failed to initialize:', error);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GalaxyScene, NeuralMesh };
}
