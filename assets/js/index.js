    // Video data - replace with your actual Google Drive video IDs
    const videoData = {
    verse1: '1baJsEAH6ytZ4eiMyDi-yr0itqPXMDW4A', // Atmosphere video
    verse2: 'YOUR_GOOGLE_DRIVE_VIDEO_ID_2', // Land Surface video
    verse3: 'YOUR_GOOGLE_DRIVE_VIDEO_ID_3', // Oceans video
    verse4: 'YOUR_GOOGLE_DRIVE_VIDEO_ID_4', // Cryosphere video
    verse5: 'YOUR_GOOGLE_DRIVE_VIDEO_ID_5'  // Human Impact video
};

    // Function to open video modal
    function openVideoModal(videoId) {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');

    // Construct Google Drive embed URL
    const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;

    // Set iframe source
    videoFrame.src = embedUrl;

    // Show modal
    modal.style.display = 'block';

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

    // Function to close video modal
    function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');

    // Hide modal
    modal.style.display = 'none';

    // Stop video
    videoFrame.src = '';

    // Restore body scroll
    document.body.style.overflow = 'auto';
}

    // Update play button click handlers
    function setupVideoButtons() {
    // Get all play buttons
    const playButtons = document.querySelectorAll('.play-btn');

    playButtons.forEach((button, index) => {
    // Remove any existing click listeners
    button.replaceWith(button.cloneNode(true));
});

    // Re-attach click listeners with correct video IDs
    document.querySelectorAll('.play-btn').forEach((button, index) => {
    const videoKeys = Object.keys(videoData);
    const videoKey = videoKeys[index];

    button.addEventListener('click', () => {
    openVideoModal(videoData[videoKey]);
});
});

    // Close modal when clicking X
    document.querySelector('.close-modal').addEventListener('click', closeVideoModal);

    // Close modal when clicking outside
    document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') {
    closeVideoModal();
}
});

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
    closeVideoModal();
}
});
}
    // Initialize Three.js with realistic Earth
    function initEarth() {

    const container = document.getElementById('earth-container');
    const loading = document.querySelector('.loading');

    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
    );
    camera.position.z = 8;

    // Create renderer with better quality
    const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Create realistic starfield
    createRealisticStars(scene);

    // Load Earth textures
    const textureLoader = new THREE.TextureLoader();

    // Use high-quality NASA Earth textures
    const earthTextures = {
    albedo: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    specular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    normal: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_2048.png',
    night: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_night_2048.jpg'
};

    // Fallback to simpler textures if NASA ones fail to load
    const fallbackTextures = {
    albedo: createProceduralEarthTexture(),
    specular: createProceduralSpecularMap(),
    normal: createProceduralNormalMap(),
    clouds: createProceduralCloudTexture(),
    night: createNightTexture()
};

    // Create Earth group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);


    // Load textures with fallbacks
    Promise.all([
    loadTextureWithFallback(earthTextures.albedo, fallbackTextures.albedo),
    loadTextureWithFallback(earthTextures.specular, fallbackTextures.specular),
    loadTextureWithFallback(earthTextures.normal, fallbackTextures.normal),
    loadTextureWithFallback(earthTextures.clouds, fallbackTextures.clouds),
    loadTextureWithFallback(earthTextures.night, fallbackTextures.night)
    ]).then(([albedoMap, specularMap, normalMap, cloudsMap, nightMap]) => {
    // Remove loading text
    loading.style.display = 'none';

    // Create Earth geometry with more detail
    const earthGeometry = new THREE.SphereGeometry(2, 128, 128);

    // Create realistic Earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
    map: albedoMap,
    specularMap: specularMap,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    shininess: 10,
    transparent: true,
    opacity: 1
});

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Add night lights
    const nightMaterial = new THREE.MeshBasicMaterial({
    map: nightMap,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8
});

    const nightEarth = new THREE.Mesh(earthGeometry.clone(), nightMaterial);
    nightEarth.scale.setScalar(1.001);
    earthGroup.add(nightEarth);

    // Add realistic clouds
    const cloudsGeometry = new THREE.SphereGeometry(2.02, 128, 128);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
    map: cloudsMap,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
});

    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(clouds);

    // Add atmospheric glow
    createAtmosphericGlow(scene, earthGroup);

    // Add satellites
    createSatellites(earthGroup);

    // Add lens flare for sun effect
    createSunLight(scene, camera);

}).catch(error => {
    console.error('Error loading textures:', error);
    loading.textContent = 'Error loading Earth model. Using fallback.';
    // Fallback to procedural textures
    createProceduralEarth(scene, earthGroup);
    loading.style.display = 'none';
});

    // Add realistic lighting
    const ambientLight = new THREE.AmbientLight(0x333333, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(10, 5, 5);
    scene.add(sunLight);

    // Add subtle point lights for better depth
    const pointLight1 = new THREE.PointLight(0x4488ff, 0.3, 50);
    pointLight1.position.set(-10, 0, 0);
    scene.add(pointLight1);

    // Animation loop
    function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Rotate Earth and clouds
    if (earthGroup.children.length > 0) {
    earthGroup.rotation.y += 0.001;

    // Rotate clouds slightly faster
    const clouds = earthGroup.children.find(child =>
    child.material && child.material.transparent && child.material.opacity === 0.4
    );
    if (clouds) {
    clouds.rotation.y += 0.0015;
}

    // Update satellites
    updateSatellites(earthGroup);
}

    renderer.render(scene, camera);
}

    // Handle window resize
    function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

    // Helper function to load texture with fallback
    function loadTextureWithFallback(url, fallback) {
    return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
    url,
    (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    resolve(texture);
},
    undefined,
    () => {
    // If loading fails, use fallback
    resolve(fallback);
}
    );
});
}

    // Create realistic starfield
    function createRealisticStars(scene) {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 10000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    // Random position in a sphere
    const radius = 500 + Math.random() * 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Random color (mostly white with some blue/red stars)
    const colorVariation = Math.random();
    if (colorVariation < 0.7) {
    colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1; // White
} else if (colorVariation < 0.85) {
    colors[i3] = 0.8; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1; // Blue
} else {
    colors[i3] = 1; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.8; // Red
}

    // Random size
    sizes[i] = Math.random() * 2;
}

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true
});

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

    // Create atmospheric glow
    function createAtmosphericGlow(scene, earthGroup) {
    const glowGeometry = new THREE.SphereGeometry(2.2, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
    glowColor: { value: new THREE.Color(0x00aaff) },
    viewVector: { value: new THREE.Vector3() }
},
    vertexShader: `
                    uniform vec3 viewVector;
                    varying float intensity;
                    void main() {
                        vec3 vNormal = normalize(normalMatrix * normal);
                        vec3 vNormel = normalize(normalMatrix * viewVector);
                        intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
    fragmentShader: `
                    uniform vec3 glowColor;
                    varying float intensity;
                    void main() {
                        vec3 glow = glowColor * intensity;
                        gl_FragColor = vec4(glow, intensity * 0.5);
                    }
                `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

    const atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
    earthGroup.add(atmosphere);
}

    // Create satellites
    function createSatellites(earthGroup) {
    const satelliteCount = 3;

    for (let i = 0; i < satelliteCount; i++) {
    const satelliteGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.15);
    const satelliteMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 100
});

    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);

    // Random orbit parameters
    const radius = 2.8 + Math.random() * 0.5;
    const speed = 0.002 + Math.random() * 0.002;
    const angle = Math.random() * Math.PI * 2;
    const inclination = Math.random() * Math.PI * 2;

    satellite.userData = { radius, speed, angle, inclination };

    earthGroup.add(satellite);
}
}

    // Update satellite positions
    function updateSatellites(earthGroup) {
    earthGroup.children.forEach(child => {
        if (child.userData.radius) {
            child.userData.angle += child.userData.speed;

            const radius = child.userData.radius;
            const angle = child.userData.angle;
            const inclination = child.userData.inclination;

            child.position.x = radius * Math.cos(angle) * Math.sin(inclination);
            child.position.y = radius * Math.sin(angle) * Math.sin(inclination);
            child.position.z = radius * Math.cos(inclination);

            // Make satellite always point toward Earth
            child.lookAt(0, 0, 0);
        }
    });
}

    // Create sun light with lens flare effect
    function createSunLight(scene, camera) {
    const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(20, 10, 5);
    scene.add(sun);
}

    // Fallback procedural Earth creation
    function createProceduralEarth(scene, earthGroup) {
    const earthGeometry = new THREE.SphereGeometry(2, 128, 128);

    const earthMaterial = new THREE.MeshPhongMaterial({
    map: createProceduralEarthTexture(),
    specularMap: createProceduralSpecularMap(),
    normalMap: createProceduralNormalMap(),
    normalScale: new THREE.Vector2(0.5, 0.5),
    shininess: 10
});

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Add clouds
    const cloudsGeometry = new THREE.SphereGeometry(2.02, 128, 128);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
    map: createProceduralCloudTexture(),
    transparent: true,
    opacity: 0.4,
    depthWrite: false
});

    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(clouds);

    createAtmosphericGlow(scene, earthGroup);
    createSatellites(earthGroup);
}

    // Procedural texture creation functions
    function createProceduralEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    // Base ocean color
    context.fillStyle = '#1a5276';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw more realistic continents
    const continents = [
{ x: 300, y: 200, width: 400, height: 300, color: '#2e7d32' }, // Americas
{ x: 800, y: 150, width: 600, height: 400, color: '#388e3c' }, // Eurasia
{ x: 600, y: 400, width: 300, height: 350, color: '#2e7d32' }, // Africa
{ x: 1300, y: 450, width: 200, height: 200, color: '#4caf50' }, // Australia
{ x: 200, y: 600, width: 150, height: 150, color: '#388e3c' }  // Antarctica
    ];

    continents.forEach(continent => {
    context.fillStyle = continent.color;
    context.beginPath();
    context.ellipse(
    continent.x, continent.y,
    continent.width / 2, continent.height / 2,
    0, 0, Math.PI * 2
    );
    context.fill();

    // Add some texture to continents
    context.fillStyle = '#1b5e20';
    for (let i = 0; i < 50; i++) {
    const x = continent.x + (Math.random() - 0.5) * continent.width;
    const y = continent.y + (Math.random() - 0.5) * continent.height;
    const radius = 5 + Math.random() * 15;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
}
});

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

    function createProceduralSpecularMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    // Oceans are more reflective
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#333333';
    context.beginPath();
    context.ellipse(300, 200, 200, 150, 0, 0, Math.PI * 2);
    context.ellipse(800, 150, 300, 200, 0, 0, Math.PI * 2);
    context.ellipse(600, 400, 150, 175, 0, 0, Math.PI * 2);
    context.ellipse(1300, 450, 100, 100, 0, 0, Math.PI * 2);
    context.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

    function createProceduralNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    // Create terrain elevation
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.2, '#333333');
    gradient.addColorStop(0.5, '#666666');
    gradient.addColorStop(0.8, '#333333');
    gradient.addColorStop(1, '#000000');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add mountain ranges
    context.fillStyle = '#888888';
    for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const width = 20 + Math.random() * 80;
    const height = 10 + Math.random() * 40;
    context.beginPath();
    context.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    context.fill();
}

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

    function createProceduralCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw realistic cloud patterns
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const width = 30 + Math.random() * 100;
    const height = 20 + Math.random() * 60;

    context.beginPath();
    context.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    context.fill();
}

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

    function createNightTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add city lights
    context.fillStyle = '#ffffcc';
    for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 0.5 + Math.random() * 1.5;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
}

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

    // Mobile Navigation Toggle
    document.querySelector('.mobile-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
    });
});

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
    document.querySelector('nav').style.backgroundColor = 'rgba(5, 10, 20, 0.95)';
    document.querySelector('nav').style.padding = '10px 0';
} else {
    document.querySelector('nav').style.backgroundColor = 'rgba(5, 10, 20, 0.9)';
    document.querySelector('nav').style.padding = '15px 0';
}
});

    // Initialize 3D Earth when page loads
    window.addEventListener('DOMContentLoaded', () => {
    initEarth();
});


    // Mobile Navigation Toggle
    document.querySelector('.mobile-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
    });
});

    // Tab functionality for data section
    document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Show corresponding content
        const tabId = button.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
});

    // Progress tracker for video chapters
    function updateProgressTracker() {
    const chapters = document.querySelectorAll('.chapter');
    const dots = document.querySelectorAll('.progress-dot');

    // Find which chapter is currently in view
    let currentChapter = '';
    chapters.forEach(chapter => {
    const rect = chapter.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
    currentChapter = chapter.id;
}
});

    // Update active dot
    dots.forEach(dot => {
    if (dot.getAttribute('data-target') === currentChapter) {
    dot.classList.add('active');
} else {
    dot.classList.remove('active');
}
});
}

    // Click handler for progress dots
    document.querySelectorAll('.progress-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

    // Generate temperature chart
    function generateTemperatureChart() {
    const chart = document.getElementById('temperature-chart');
    const years = [2000, 2005, 2010, 2015, 2020, 2023];
    const temps = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2]; // Temperature anomaly in °C

    years.forEach((year, index) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${temps[index] * 150}px`; // Scale for visualization

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = year;

    bar.appendChild(label);
    chart.appendChild(bar);

    // Add tooltip
    bar.setAttribute('title', `${year}: +${temps[index]}°C`);
});
}

    // Generate forest chart
    function generateForestChart() {
    const chart = document.getElementById('forest-chart');
    const years = [2000, 2005, 2010, 2015, 2020, 2023];
    const forestCover = [100, 98, 96, 94, 92, 90]; // Percentage of 2000 level

    years.forEach((year, index) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${forestCover[index] * 2}px`; // Scale for visualization
    bar.style.background = 'linear-gradient(to top, #27ae60, #2ecc71)';

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = year;

    bar.appendChild(label);
    chart.appendChild(bar);

    // Add tooltip
    bar.setAttribute('title', `${year}: ${forestCover[index]}% of 2000 forest cover`);
});
}

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});


    // Navbar background on scroll
    window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
    document.querySelector('nav').style.backgroundColor = 'rgba(5, 10, 20, 0.95)';
    document.querySelector('nav').style.padding = '10px 0';
} else {
    document.querySelector('nav').style.backgroundColor = 'rgba(5, 10, 20, 0.9)';
    document.querySelector('nav').style.padding = '15px 0';
}

    // Update progress tracker
    updateProgressTracker();
});

    // Initialize when page loads
    window.addEventListener('DOMContentLoaded', () => {
    generateTemperatureChart();
    generateForestChart();
    updateProgressTracker();
    setupVideoButtons();
});