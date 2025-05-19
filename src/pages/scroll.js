import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap';

/**
 * Debug
 */
const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

const parameters = {
    materialColor: '#5d207e'
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

const particlesTextures = {}
for (let i = 1; i < 14; i++) { particlesTextures[i] = textureLoader.load('/textures/particles/' + i.toString() + '.png')}


/**
 * Objects
 */
// Materials
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

gui.addColor(parameters, 'materialColor').onChange(() => {material.color.set(parameters.materialColor)})

// Meshes
const objectsDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, .4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(.8, .35, 100, 16),
    material
)

mesh1.position.y = -objectsDistance * 0
mesh1.position.x = 2
mesh2.position.y = -objectsDistance * 1
mesh2.position.x = -1.75
mesh3.position.y = -objectsDistance * 2
mesh3.position.x = 1.75

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

// Particles
const particlesGeometry = new THREE.BufferGeometry()

parameters.particlesCount = 500
const particlesPositions = new Float32Array(parameters.particlesCount * 3) // count * (x, y, z)
const particlesColors = new Float32Array(parameters.particlesCount * 3) // count * (r, g, b)

for (let i = 0; i < parameters.particlesCount; i++) {
    const x = i * 3
    particlesPositions[x]     = (Math.random() - 0.5) * 8
    particlesPositions[x + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
    particlesPositions[x + 2] = (Math.random() - 0.25) * 20
    
    particlesColors[x]     = Math.random()
    particlesColors[x + 1] = Math.random()
    particlesColors[x + 2] = Math.random()
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3))

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    // map: particlesTextures[1],
    transparent: true,
    alphaMap: particlesTextures[9],
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const particlesGUI = gui.addFolder('particles')
particlesGUI.add(particlesMaterial, 'size').min(0).max(.5).listen()
particlesGUI.addColor(particlesMaterial, 'color').listen()


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)

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
// Camrera group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY

    const newSection = Math.round(scrollY / sizes.height)

    if (newSection != currentSection) {
        currentSection = newSection

        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+= 6',
            y: '+= 3',
            z: '+= .5'
        })

        console.log(newSection)
    }
})


/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - .5
    cursor.y = event.clientY / sizes.height - .5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate particles
    particlesMaterial.size = Math.tanh(elapsedTime * .4) * Math.sin(elapsedTime * .4) * Math.cos(elapsedTime) * .1 + .15
    particlesMaterial.color.r = Math.abs(Math.sin(elapsedTime * 0.3))
    particlesMaterial.color.g = Math.abs(Math.cos(elapsedTime * 0.6))
    particlesMaterial.color.b = Math.abs(Math.sin(elapsedTime * 0.4))


    // Animate camera
    camera.position.y = - scrollY*objectsDistance / sizes.height

    const parallaxX = cursor.x * .5
    const parallaxY = -cursor.y * .5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime


    // Animate meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * .1
        mesh.rotation.y += deltaTime * .12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()