import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particlesTextures = {}
for (let i = 1; i < 14; i++) { particlesTextures[i] = textureLoader.load('/textures/particles/' + i.toString() + '.png')}

/**
 * Galaxy
 */
const parameters = {
    count: 100000,
    size: 0.02,
    radius: 5,
    branches: 3,
    spin: 1.5,
    randomness: .6,
    randomnessPower: 1.4,
    insideColor: "#ff6030",
    outsideColor: "#1b3984"
}

let particlesGeometry = null
let particlesMaterial = null
let particles = null

function generateGalaxy() {
    // Cleanup
    if (particles !== null) {
        particlesGeometry.dispose()
        particlesMaterial.dispose()
        scene.remove(particles)
    }

    // Geometry
    particlesGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3) // count * (x, y, z)
    const colors = new Float32Array(parameters.count * 3) // count * (r, g, b)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor).convertSRGBToLinear()

    for (let i = 0; i < parameters.count; i++) {
        const x = i * 3

        const radius = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const spinAngle = parameters.spin * radius

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness


        positions[x]     = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[x + 1] = randomY
        positions[x + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // -------
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[x    ] = mixedColor.r
        colors[x + 1] = mixedColor.g
        colors[x + 2] = mixedColor.b

    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Material
    particlesMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        transparent: true,
        // alphaMap: particlesTextures[9],
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    // Points
    particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
}

generateGalaxy()

/**
 * Tweaks
 */
gui.add(parameters, 'count').min(0).max(1000000).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.0001).max(0.1).step(0.0001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.0001).max(20).step(0.0001).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.0001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.0001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.0001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.y = 5
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * GUI Debug
 */



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()