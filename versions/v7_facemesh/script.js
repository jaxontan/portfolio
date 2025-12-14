/* ========================================
   JAXON TAN — FACE-MESH CORE [v7.0]
   Three.js & MediaPipe Holistic
   ======================================== */

import * as THREE from 'three';

// --- Global Variables ---
let scene, camera, renderer, particles;
let faceGeometry, facePoints; // The Face Mesh Object
let videoElement, gestureCanvas, gestureCtx;
let holistic; // MediaPipe Holistic instance
let cameraUtils; // MediaPipe Camera instance

// Interaction State
let isCameraActive = false;
let prevPinchY = null; // For scrolling

// Initialize on Load
init();

function init() {
    console.log("INITIALIZING SYSTEM [v7]...");

    // 1. Setup Three.js Scene
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3); // Close up for face

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Objects
    createFaceMesh();
    createParticles(); // Background dust
    createLights();

    // 2. Setup Gesture UI
    videoElement = document.getElementById('webcam-video');
    gestureCanvas = document.getElementById('gesture-canvas');
    if (gestureCanvas) {
        gestureCtx = gestureCanvas.getContext('2d');
        resizeGestureCanvas();
    }

    // 3. Listeners
    window.addEventListener('resize', onWindowResize);
    const camBtn = document.getElementById('camera-btn');
    if (camBtn) camBtn.addEventListener('click', enableCamera);

    // 4. Start Render Loop
    animate();
}

function createFaceMesh() {
    // MediaPipe FaceMesh has 468 landmarks
    const vertexCount = 468;
    faceGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(vertexCount * 3);

    // Initialize points spread out or at zero
    for (let i = 0; i < vertexCount * 3; i++) {
        positions[i] = 0;
    }

    faceGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Neon Material
    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    facePoints = new THREE.Points(faceGeometry, material);
    facePoints.scale.set(-1, -1, 1); // Flip because Webcam is mirrored
    scene.add(facePoints);
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 1000; i++) {
        vertices.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ size: 0.03, color: 0xff0055, transparent: true, opacity: 0.3 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createLights() {
    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);
    const point = new THREE.PointLight(0x00f3ff, 1, 10);
    point.position.set(2, 2, 2);
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
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' }
        });
        videoElement.srcObject = stream;
        await videoElement.play();

        // Init Holistic (Face + Hands)
        holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
            }
        });

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        holistic.onResults(onHolisticResults);

        cameraUtils = new Camera(videoElement, {
            onFrame: async () => {
                await holistic.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
        cameraUtils.start();

        // UI Updates
        isCameraActive = true;
        loader.classList.add('hidden');
        statusTxt.textContent = "ONLINE // FACE_MESH_ACTIVE";
        statusTxt.classList.add('active');
        handStatus.textContent = "TRACKING";
        handStatus.classList.add('online');
        document.getElementById('gesture-icon').textContent = '👤';
        document.getElementById('gesture-icon').classList.add('active');

    } catch (err) {
        console.error(err);
        btn.textContent = "ACCESS DENIED";
        statusTxt.textContent = "ERROR: CAMERA_BLOCKED";
    }
}

function onHolisticResults(results) {
    if (!gestureCtx) return;

    // Clear 2D overlay
    gestureCtx.save();
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);

    // 1. UPDATE FACE MESH (3D)
    if (results.faceLandmarks) {
        const positions = faceGeometry.attributes.position.array;

        // MediaPipe coords: x, y (0..1), z (approx).
        // We map them to center screen
        for (let i = 0; i < 468; i++) {
            const lm = results.faceLandmarks[i];

            // Map 0..1 to -3..3 approx range for Three.js
            const x = (lm.x - 0.5) * 5;
            const y = (lm.y - 0.5) * 5;
            const z = -lm.z * 5; // Invert Z for depth

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        faceGeometry.attributes.position.needsUpdate = true;
    }

    // 2. UPDATE HANDS (Logic + 2D Overlay)
    // We check rightHandLandmarks (or left)
    const handLMs = results.rightHandLandmarks || results.leftHandLandmarks; // Use either hand

    if (handLMs) {
        // Draw 2D Skeleton
        drawConnectors(gestureCtx, handLMs, HAND_CONNECTIONS, { color: '#00f3ff', lineWidth: 2 });
        drawLandmarks(gestureCtx, handLMs, { color: '#ff0055', lineWidth: 1, radius: 3 });

        // Scroll Logic (Pinch)
        const indexTip = handLMs[8];
        const thumbTip = handLMs[4];

        const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const isPinched = distance < 0.05;

        if (isPinched) {
            document.body.style.cursor = 'grabbing';
            if (prevPinchY !== null) {
                const delta = indexTip.y - prevPinchY;
                window.scrollBy({ top: -delta * 2000, behavior: 'auto' });
            }
            prevPinchY = indexTip.y;
            document.getElementById('gesture-data').style.color = '#0f0';
        } else {
            document.body.style.cursor = 'default';
            prevPinchY = null;
            document.getElementById('gesture-data').style.color = 'var(--cyan)';
        }

        // Update Data
        document.getElementById('gesture-data').textContent = `X:${((indexTip.x - 0.5) * 2).toFixed(2)} Y:${((indexTip.y - 0.5) * 2).toFixed(2)}`;

    } else {
        prevPinchY = null;
    }

    gestureCtx.restore();
}

function resizeGestureCanvas() {
    if (gestureCanvas) {
        gestureCanvas.width = window.innerWidth;
        gestureCanvas.height = window.innerHeight;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeGestureCanvas();
}

function animate() {
    requestAnimationFrame(animate);

    if (facePoints) {
        // Gentle rotation if no camera, or just stabilization?
        // Let's keep it static world space so it follows head movement exactly.
        // facePoints.rotation.y += 0.001; 
    }

    if (particles) particles.rotation.y -= 0.001;

    renderer.render(scene, camera);
}
