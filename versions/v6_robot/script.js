/* ========================================
   JAXON TAN — CYBER-AVATAR [v6.0]
   Three.js & MediaPipe Hands
   ======================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Global Variables ---
let scene, camera, renderer, particles;
let avatar, mixer, actions = {}; // 3D Model & Animation
let videoElement, gestureCanvas, gestureCtx;
let hands; // MediaPipe Hands instance
let cameraUtils; // MediaPipe Camera instance

// Interaction State
let isCameraActive = false;
let handX = 0, handY = 0; // Normalized -1 to 1
let prevPinchY = null; // For scrolling
const clock = new THREE.Clock(); // For animation mixing

// Initialize on Load
init();

function init() {
    console.log("INITIALIZING SYSTEM...");

    // 1. Setup Three.js Scene
    const canvas = document.querySelector('#webgl');
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8); // Moved back slightly to see full robot

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Better colors for GLTF

    // Objects
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
    animate();
}

// Load the 3D Avatar (Robot)
function loadAvatar() {
    const loader = new GLTFLoader();
    const modelUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

    loader.load(modelUrl, (gltf) => {
        avatar = gltf.scene;
        scene.add(avatar);

        // Setup Avatar Position
        avatar.position.y = -2; // Lower it to stand on "floor"
        avatar.scale.set(1.5, 1.5, 1.5); // Make it visible

        // Setup Animations
        mixer = new THREE.AnimationMixer(avatar);
        const clips = gltf.animations;

        // Load known clips for this model: 'Idle', 'Walking', 'Running', 'Wave', etc.
        const waveClip = THREE.AnimationClip.findByName(clips, 'Wave');
        const idleClip = THREE.AnimationClip.findByName(clips, 'Idle');

        actions['Wave'] = mixer.clipAction(waveClip);
        actions['Idle'] = mixer.clipAction(idleClip);

        // Play Wave then Idle
        actions['Wave'].play();
        setTimeout(() => {
            actions['Wave'].fadeOut(0.5);
            actions['Idle'].reset().fadeIn(0.5).play();
        }, 2000);

        console.log("AVATAR LOADED");

    }, undefined, (error) => {
        console.error('An error happened loading the avatar:', error);
    });
}

function speakIntro() {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = "Welcome user. I am your virtual assistant. System is online.";
        msg.volume = 1;
        msg.rate = 1;
        msg.pitch = 1;
        window.speechSynthesis.speak(msg);
    }
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
    const ambient = new THREE.HemisphereLight(0xffffff, 0x444444);
    ambient.position.set(0, 20, 0);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);
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

        // 2. Load Avatar & Speak
        loadAvatar();
        speakIntro();

        // 3. Init MediaPipe Hands (Global from Script Tag)
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
        statusTxt.textContent = "ONLINE // AVATAR_LINKED";
        statusTxt.classList.add('active');
        handStatus.textContent = "TRACKING";
        handStatus.classList.add('online');
        document.getElementById('gesture-icon').classList.add('active');

    } catch (err) {
        console.error(err);
        btn.textContent = "ACCESS DENIED";
        statusTxt.textContent = "ERROR: SYSTEM_FAILURE";
    }
}

function onHandResults(results) {
    if (!gestureCtx) return;

    // Clear canvas
    gestureCtx.save();
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // DRAW SKELETON
        // Assuming global media pipe drawing utils
        drawConnectors(gestureCtx, landmarks, HAND_CONNECTIONS, { color: '#00f3ff', lineWidth: 2 });
        drawLandmarks(gestureCtx, landmarks, { color: '#ff0055', lineWidth: 1, radius: 3 });

        // GESTURE LOGIC
        // 1. Rotation Control
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Convert 0-1 to -1 to 1 range, inverted X for mirror effect
        handX = (indexTip.x - 0.5) * -2;
        handY = (indexTip.y - 0.5) * -2;

        // 2. Pinch Detection & Scrolling
        const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const isPinched = distance < 0.05;

        if (isPinched) {
            document.body.style.cursor = 'grabbing';

            // Scroll Logic
            if (prevPinchY !== null) {
                const currentY = indexTip.y;
                const delta = currentY - prevPinchY;
                const scrollSpeed = 2000;
                window.scrollBy({ top: -delta * scrollSpeed, behavior: 'auto' });
            }
            prevPinchY = indexTip.y;

            // Update HUD
            document.getElementById('gesture-data').style.color = '#0f0';

        } else {
            document.body.style.cursor = 'default';
            prevPinchY = null;
            document.getElementById('gesture-data').style.color = 'var(--cyan)';
        }

        // Update UI Text
        document.getElementById('gesture-data').textContent = `X:${handX.toFixed(2)} Y:${handY.toFixed(2)}`;

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

    const delta = clock.getDelta();

    // Update Avatar Animation
    if (mixer) mixer.update(delta);

    if (avatar) {
        // Base Rotation
        // avatar.rotation.y += 0.005;

        // Hand Interaction Override
        if (isCameraActive) {
            // Smooth lerp to hand position for rotation
            // Rotate the avatar based on hand X
            const targetRotation = handX * 2;
            avatar.rotation.y += (targetRotation - avatar.rotation.y) * 0.1;
        }
    }

    if (particles) particles.rotation.y -= 0.001;

    renderer.render(scene, camera);
}
