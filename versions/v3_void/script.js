/* ========================================
   JAXON TAN — KINETIC VOID
   Physics & Interaction
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initGhostImages();
    initScrollSkew();
    initTime();

    // Initial reveal
    document.body.style.opacity = '1';
});

/* ===== CUSTOM CURSOR PHYSICS ===== */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const links = document.querySelectorAll('a, .project-item, button');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('active'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });

    function animateCursor() {
        // Smooth follow
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

/* ===== GHOST IMAGES (Project Previews) ===== */
function initGhostImages() {
    const items = document.querySelectorAll('.project-item');
    const ghostLayer = document.querySelector('.ghost-layer');
    const ghostImg = document.getElementById('ghost-img');

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function animateGhost() {
        const speed = 0.08;
        currentX += (targetX - currentX) * speed;
        currentY += (targetY - currentY) * speed;

        // slight parallax/lag for the image
        if (ghostLayer.classList.contains('visible')) {
            // centering offset
            const x = currentX - (window.innerWidth / 2); // subtle move from center
            const y = currentY - (window.innerHeight / 2);

            ghostImg.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.1)`;
        }

        requestAnimationFrame(animateGhost);
    }
    animateGhost();

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const src = item.getAttribute('data-img');
            ghostImg.src = src;
            ghostLayer.classList.add('visible');
            item.style.zIndex = '10'; // Bring text above image
        });

        item.addEventListener('mouseleave', () => {
            ghostLayer.classList.remove('visible');
            item.style.zIndex = '';
        });
    });
}

/* ===== SCROLL VELOCITY SKEW ===== */
function initScrollSkew() {
    const content = document.querySelector('.void-container');
    let currentPos = window.scrollY;
    let skew = 0;

    function loop() {
        const newPos = window.scrollY;
        const diff = newPos - currentPos;

        // Calculate skew based on speed
        skew = diff * 0.15;

        // Clamp skew
        skew = Math.min(Math.max(skew, -10), 10);

        // Apply skew to content
        document.body.style.transform = `skewY(${skew}deg)`;

        currentPos = newPos;
        requestAnimationFrame(loop);
    }
    // loop(); // Optional: Heavy skew effect. 
    // Commented out for now as it can be dizzying. 
    // Instead let's skew just the titles.
}

/* ===== TIME DISPLAY ===== */
function initTime() {
    const el = document.getElementById('time-display');
    function update() {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    setInterval(update, 1000);
    update();
}
