/* ========================================
   JAXON TAN — CYBER-CORE [v4.0]
   Three.js Engine & Logic
   ======================================== */

// Global Variables
let scene, camera, renderer;
let core, coreWireframe, particles;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('DOMContentLoaded', init);

function init() {
    // 1. Scene Setup
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();
    // Fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true // Allow CSS background
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 4. Create Objects
    createCore();
    createParticles();
    createLights();

    // 5. Event Listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onDocumentScroll);

    // 6. Start Loop
    animate();

    // 7. Initialize UI
    startTime();
    // Simulate loading delay for effect
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1500);
}

function createCore() {
    // Inner Glow Geometry
    const geometry = new THREE.IcosahedronGeometry(1.5, 0); // Low poly
    const material = new THREE.MeshLambertMaterial({
        color: 0x00f3ff,
        emissive: 0x001133,
        wireframe: false,
        transparent: true,
        opacity: 0.1
    });
    core = new THREE.Mesh(geometry, material);
    scene.add(core);

    // Wireframe Cage
    const wireGeo = new THREE.WireframeGeometry(geometry);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x00f3ff });
    coreWireframe = new THREE.LineSegments(wireGeo, wireMat);
    core.add(coreWireframe);

    // Second cage (Magenta)
    const geo2 = new THREE.IcosahedronGeometry(2.0, 1);
    const wireGeo2 = new THREE.WireframeGeometry(geo2);
    const wireMat2 = new THREE.LineBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.3 });
    const cage = new THREE.LineSegments(wireGeo2, wireMat2);
    core.add(cage);
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    // Create 2000 random particles
    for (let i = 0; i < 2000; i++) {
        vertices.push(
            (Math.random() - 0.5) * 50, // x
            (Math.random() - 0.5) * 50, // y
            (Math.random() - 0.5) * 50  // z
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createLights() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white
    scene.add(ambientLight);

    // Point Lights (Cyber Colors)
    const light1 = new THREE.PointLight(0x00f3ff, 2, 50);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff0055, 2, 50);
    light2.position.set(-5, -5, 5);
    scene.add(light2);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;

    // Update Coords UI
    const x = event.clientX.toFixed(2);
    const y = event.clientY.toFixed(2);
    document.getElementById('coords').textContent = `X:${x} / Y:${y}`;
}

function onDocumentScroll() {
    const scrollY = window.scrollY;

    // Camera Fly-through effect
    // As we scroll down, camera moves back? Or Core moves up?
    // Let's rotate the core faster

    if (core) {
        core.rotation.y += 0.05;
        core.scale.setScalar(1 + scrollY * 0.0005); // Pulsate
    }

    camera.position.z = 5 + scrollY * 0.005; // Fly OUT
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Smooth Rotate
    targetX = mouseX * 2;
    targetY = mouseY * 2;

    if (core) {
        core.rotation.y += 0.005;
        core.rotation.x += 0.002;

        // Interactive Tilt
        core.rotation.x += 0.05 * (targetY - core.rotation.x);
        core.rotation.y += 0.05 * (targetX - core.rotation.y);
    }

    if (particles) {
        particles.rotation.y -= 0.001; // Slowly rotate starry background
    }

    renderer.render(scene, camera);
}

// UI Timer
function startTime() {
    function update() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        document.getElementById('session-time').textContent = timeString;
    }
    setInterval(update, 1000);
    update();
}
