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
 * Particles
 */

// Geometry
const particlesGeometry = new THREE.BufferGeometry()
const count = 100000

const positions = new Float32Array(count * 3) // count * (x, y, z)
const colors = new Float32Array(count * 3) // count * (r, g, b)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200
    colors[i] = Math.random()
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    color: 'yellow',
    // map: particlesTextures[1],
    transparent: true,
    alphaMap: particlesTextures[9],
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


// Cube
const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
cube.visible = false
scene.add(cube)

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
camera.position.z = 3
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
const debugObject = {
    alphaMap: 9,
    renderingMethod: 'depthWrite',
    additiveBlending: 'AdditiveBlending',
}
gui.add(cube, 'visible').name('cube')
gui.add(particlesMaterial, 'size').min(0).max(1).listen()
gui.add(particlesMaterial, 'sizeAttenuation').onChange(() => {
    particlesMaterial.needsUpdate = true
})
gui.addColor(particlesMaterial, 'color').listen()
gui.add(debugObject, 'alphaMap').options(Object.keys(particlesTextures)).onChange((v) => {particlesMaterial.alphaMap = particlesTextures[v]})
gui.add(debugObject, 'renderingMethod').options(['None', 'alphaTest', 'depthTest', 'depthWrite']).onChange((v) => {
    if (v == 'None') {particlesMaterial.alphaTest = 0.0; particlesMaterial.depthTest = true}
    else if (v == 'alphaTest') {particlesMaterial.alphaTest = 0.001; particlesMaterial.depthTest = true; }
    else if (v == 'depthTest') {particlesMaterial.alphaTest = 0; particlesMaterial.depthTest = false; }
    else if (v == 'depthWrite') {particlesMaterial.alphaTest = 0; particlesMaterial.depthTest = true; particlesMaterial.depthWrite = false}
    particlesMaterial.needsUpdate = true
})
gui.add(particlesMaterial, 'blending').options({
    'NoBlending': THREE.NoBlending,
    'NormalBlending': THREE.NormalBlending,
    'AdditiveBlending': THREE.AdditiveBlending,
    'SubtractiveBlending': THREE.SubtractiveBlending,
    'MultiplyBlending': THREE.MultiplyBlending,
})


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    particlesMaterial.size = Math.abs(Math.sin(elapsedTime * .4))
    particlesMaterial.color.r = Math.abs(Math.sin(elapsedTime * 0.3))
    particlesMaterial.color.g = Math.abs(Math.cos(elapsedTime * 0.6))
    particlesMaterial.color.b = Math.abs(Math.sin(elapsedTime * 0.4))


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()