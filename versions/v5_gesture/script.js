/* ========================================
   JAXON TAN — GESTURE-CORE [v5.0]
   Three.js & MediaPipe Hands
   ======================================== */

// --- Global Variables ---
let scene, camera, renderer, core, particles;
let videoElement, gestureCanvas, gestureCtx;
let hands; // MediaPipe Hands instance
let cameraUtils; // MediaPipe Camera instance

// Interaction State
let isCameraActive = false;
let handX = 0, handY = 0; // Normalized -1 to 1
let handDepth = 1; // Pinch scale
let prevPinchY = null; // For scrolling

document.addEventListener('DOMContentLoaded', init);

function init() {
    // 1. Setup Three.js Scene
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Objects
    createCore(); // Initially wireframe, will switch to video texture
    createParticles();
    createLights();

    // 2. Setup Gesture UI
    videoElement = document.getElementById('webcam-video');
    gestureCanvas = document.getElementById('gesture-canvas');
    gestureCtx = gestureCanvas.getContext('2d');
    resizeGestureCanvas();

    // 3. Listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('camera-btn').addEventListener('click', enableCamera);

    // 4. Start Render Loop
    animate();
}

function createCore() {
    // Geometry
    const geometry = new THREE.IcosahedronGeometry(2, 0);

    // Initial Material (Wireframe)
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    core = new THREE.Mesh(geometry, material);
    scene.add(core);

    // Inner glow
    const innerGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0xff0055,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    core.add(new THREE.Mesh(innerGeo, innerMat));
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 1500; i++) {
        vertices.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ size: 0.05, color: 0x00f3ff, transparent: true, opacity: 0.5 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createLights() {
    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);
    const point = new THREE.PointLight(0x00f3ff, 2, 50);
    point.position.set(5, 5, 5);
    scene.add(point);
}

// --- Webcam & MediaPipe ---
async function enableCamera() {
    const btn = document.getElementById('camera-btn');
    const loader = document.getElementById('loader');
    const statusTxt = document.getElementById('sys-status');
    const handStatus = document.getElementById('hand-status');

    btn.textContent = "INITIALIZING...";
    btn.disabled = true;

    try {
        // 1. Get Stream
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' }
        });
        videoElement.srcObject = stream;
        await videoElement.play();

        // 2. Apply Texture to Core (Digital Mirror)
        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;

        // Apply shader-like material or basic texture
        core.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            color: 0x00f3ff, // Tint it Cyan
            wireframe: false,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        // 3. Init MediaPipe Hands
        hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onHandResults);

        // Start Camera Utils Loop
        cameraUtils = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
        cameraUtils.start();

        // UI Updates
        isCameraActive = true;
        loader.classList.add('hidden');
        statusTxt.textContent = "ONLINE // NEURAL_LINK_ESTABLISHED";
        statusTxt.classList.add('active');
        handStatus.textContent = "TRACKING";
        handStatus.classList.add('online');
        document.getElementById('gesture-icon').classList.add('active');

    } catch (err) {
        console.error(err);
        btn.textContent = "ACCESS DENIED";
        statusTxt.textContent = "ERROR: CAMERA_BLOCKED";
    }
}

function onHandResults(results) {
    // Clear canvas
    gestureCtx.save();
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // DRAW SKELETON
        drawConnectors(gestureCtx, landmarks, HAND_CONNECTIONS, { color: '#00f3ff', lineWidth: 2 });
        drawLandmarks(gestureCtx, landmarks, { color: '#ff0055', lineWidth: 1, radius: 3 });

        // GESTURE LOGIC
        // 1. Rotation Control (Index Finger Tip)
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Convert 0-1 to -1 to 1 range, inverted X for mirror effect
        handX = (indexTip.x - 0.5) * -2;
        handY = (indexTip.y - 0.5) * -2;

        // 2. Pinch Detection & Scrolling
        const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const isPinched = distance < 0.05;

        if (isPinched) {
            // Visual Feedback
            document.body.style.cursor = 'grabbing';
            handDepth = 0.8;

            // Scroll Logic
            if (prevPinchY !== null) {
                const currentY = indexTip.y; // 0 (top) to 1 (bottom)
                const delta = currentY - prevPinchY;

                // Sensitivity Multiplier
                const scrollSpeed = 2000;

                // Inverse logic: Move Hand UP (y decreases) -> Content Moves UP (Scroll Down)
                window.scrollBy({
                    top: -delta * scrollSpeed,
                    behavior: 'auto'
                });
            }
            prevPinchY = indexTip.y;

            // Update HUD
            document.getElementById('gesture-data').textContent = `MODE: SCROLLING`;
            document.getElementById('gesture-data').style.color = '#0f0';

        } else {
            // Not Pinched
            document.body.style.cursor = 'default';
            prevPinchY = null;
            handDepth = 1.0;

            // Update HUD
            document.getElementById('gesture-data').textContent = `X:${handX.toFixed(2)} Y:${handY.toFixed(2)}`;
            document.getElementById('gesture-data').style.color = 'var(--cyan)';
        }
    } else {
        // No hand logic
    }
    gestureCtx.restore();
}

function resizeGestureCanvas() {
    gestureCanvas.width = window.innerWidth;
    gestureCanvas.height = window.innerHeight;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeGestureCanvas();
}

function animate() {
    requestAnimationFrame(animate);

    if (core) {
        // Default slow spin
        core.rotation.y += 0.005;
        core.rotation.x += 0.002;

        // Hand Interaction Override
        if (isCameraActive) {
            // Smooth lerp to hand position
            core.rotation.y += (handX * 2 - core.rotation.y) * 0.1;
            core.rotation.x += (handY * 2 - core.rotation.x) * 0.1;

            // Pinch Scale
            // core.scale.setScalar(handDepth); 
        }
    }

    if (particles) particles.rotation.y -= 0.001;

    renderer.render(scene, camera);
}
