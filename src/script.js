import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import coffeVertexShader from './pages_2/shaders/coffee/vertex.glsl'
import coffeFragmentShader from './pages_2/shaders/coffee/fragment.glsl'

/**
 * Base
 */
// Debug
// const gui = new GUI()
// gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color('#FFE4E1')
// scene.background = new THREE.Color('black')

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth * .25,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth * .25
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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 10
camera.position.y = 10
camera.position.z = 20
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Model
 */
let cupModel = null
gltfLoader.load(
    '../kafei.glb',
    (gltf) => {
        cupModel = gltf.scene
        cupModel.getObjectByName('baked').material.map.anisotropy = 8
        scene.add(cupModel)
        cupModel.position.y = -2.2
    }
)

// Smoke
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
smokeGeometry.translate(0, .5, 0)
smokeGeometry.scale(1.5, 10, 1.5)

// Perlin noise
const perlinTexture = textureLoader.load('/perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping



// Smoke material
const smokeMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    vertexShader: coffeVertexShader,
    fragmentShader: coffeFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
    },
})

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = -.34
scene.add(smoke)

/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    smokeMaterial.uniforms.uTime.value = elapsedTime

    if (cupModel) {
        cupModel.rotation.y += .003
        smoke.rotation.y += .003
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()