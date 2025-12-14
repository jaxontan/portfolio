/* ========================================
   JAXON TAN — FACE-MESH CORE [v7.2 DEBUG]
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

// Hyper-Mesh Configuration
const PARTICLES_PER_POINT = 9;
const POINT_COUNT = 468;
const TOTAL_POINTS = POINT_COUNT * PARTICLES_PER_POINT;
const faceOffsets = [];

// Initialize on Load
init();

function log(msg) {
    const logEl = document.getElementById('debug-log');
    if (logEl) {
        logEl.textContent = "LOG: " + msg;
        console.log(msg);
    }
}

function init() {
    log("SYSTEM INIT [v7.2]...");

    // 1. Setup Three.js Scene
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Objects
    generateOffsets();
    createFaceMesh();
    createParticles();
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
    log("RENDER LOOP STARTING");
    animate();
}

// Generate random offsets for the particle clusters
function generateOffsets() {
    for (let i = 0; i < PARTICLES_PER_POINT; i++) {
        if (i === 0) {
            faceOffsets.push({ x: 0, y: 0, z: 0 });
        } else {
            const spread = 0.05;
            faceOffsets.push({
                x: (Math.random() - 0.5) * spread,
                y: (Math.random() - 0.5) * spread,
                z: (Math.random() - 0.5) * spread
            });
        }
    }
}

function createFaceMesh() {
    faceGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(TOTAL_POINTS * 3);

    // Initialize points spread out to be visible on load (Test Pattern)
    for (let i = 0; i < TOTAL_POINTS; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = 0;
    }

    faceGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Neon Material - Increased Size for Visibility
    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xc0ffee,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    facePoints = new THREE.Points(faceGeometry, material);
    facePoints.scale.set(-1, -1, 1);
    scene.add(facePoints);
    log("FACE MESH CREATED");
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 1500; i++) {
        vertices.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ size: 0.05, color: 0xff0055, transparent: true, opacity: 0.5 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createLights() {
    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);
    const point = new THREE.PointLight(0x00f3ff, 2, 20);
    point.position.set(2, 2, 2);
    scene.add(point);
}

// --- Webcam & MediaPipe ---
async function enableCamera() {
    const btn = document.getElementById('camera-btn');
    const loader = document.getElementById('loader');
    const statusTxt = document.getElementById('sys-status');
    const handStatus = document.getElementById('hand-status');

    log("REQUESTING CAM...");
    btn.textContent = "INITIALIZING...";
    btn.disabled = true;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' }
        });
        videoElement.srcObject = stream;
        await videoElement.play();
        log("CAM ACTIVE. LOADING MP...");

        // Init Holistic
        if (typeof Holistic === 'undefined') {
            throw new Error("MediaPipe Holistic NOT FOUND");
        }

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
        log("MP CAMERA STARTED");

        // UI Updates
        isCameraActive = true;
        loader.classList.add('hidden');
        statusTxt.textContent = "ONLINE // HYPER_MESH_ACTIVE";
        statusTxt.classList.add('active');
        handStatus.textContent = "TRACKING";
        handStatus.classList.add('online');
        document.getElementById('gesture-icon').textContent = '👤';
        document.getElementById('gesture-icon').classList.add('active');

    } catch (err) {
        console.error(err);
        log("ERROR: " + err.message);
        btn.textContent = "ACCESS DENIED";
        statusTxt.textContent = "ERROR: " + err.name;
    }
}

function onHolisticResults(results) {
    if (!gestureCtx) return;

    gestureCtx.save();
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);

    // 1. UPDATE FACE MESH (High Density)
    if (results.faceLandmarks) {
        log("FACE TRACKED: " + results.faceLandmarks.length);
        const positions = faceGeometry.attributes.position.array;

        for (let i = 0; i < POINT_COUNT; i++) {
            const lm = results.faceLandmarks[i];

            // Map 0..1 to -3..3 approx range for Three.js
            const baseX = (lm.x - 0.5) * 5;
            const baseY = (lm.y - 0.5) * 5; // Flip Y? MP Y is 0 top, 1 bottom. ThreeJS Y is + up.
            // (0.5 - lm.y) * 5 might be correct for upright. 
            // We flip scale in createFaceMesh, so simple map should work.

            const baseZ = -lm.z * 5;

            for (let j = 0; j < PARTICLES_PER_POINT; j++) {
                const idx = (i * PARTICLES_PER_POINT + j) * 3;
                const offset = faceOffsets[j];

                positions[idx] = baseX + offset.x;
                positions[idx + 1] = -baseY + offset.y; // Invert Y explicitly here just in case
                positions[idx + 2] = baseZ + offset.z;
            }
        }
        faceGeometry.attributes.position.needsUpdate = true;
    } else {
        // log("Target Lost");
    }

    // 2. UPDATE HANDS
    const handLMs = results.rightHandLandmarks || results.leftHandLandmarks;

    if (handLMs) {
        drawConnectors(gestureCtx, handLMs, HAND_CONNECTIONS, { color: '#00f3ff', lineWidth: 2 });
        drawLandmarks(gestureCtx, handLMs, { color: '#ff0055', lineWidth: 1, radius: 3 });

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
    if (particles) particles.rotation.y -= 0.001;
    renderer.render(scene, camera);
}
