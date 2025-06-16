import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import halftoneVertexShader from './shaders/halftone/vertex.glsl'
import halftoneFragmentShader from './shaders/halftone/fragment.glsl'
import { normalize } from 'three/src/math/MathUtils'

/**
 * Base
 */
// Debug
const debug = {}

debug.direction = new THREE.Vector3(1.2, 1.2, 0)

const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update resolution
    material.uniforms.uResolution.value.set(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
    )

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 7
// camera.position.y = 7
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const rendererParameters = {}
rendererParameters.clearColor = '#a45656'

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(rendererParameters.clearColor)
    })

/**
 * Material
 */
const materialParameters = {}
materialParameters.color = '#ff794d'

const material = new THREE.ShaderMaterial({
    vertexShader: halftoneVertexShader,
    fragmentShader: halftoneFragmentShader,
    uniforms:
    {
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
        uShadeColor: new THREE.Uniform(new THREE.Color(materialParameters.shadeColor)),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uShadowRepetitions: new THREE.Uniform(100),
        uLightRepetitions: new THREE.Uniform(100),
        uDirection: new THREE.Uniform(debug.direction),
        uShadowLow: new THREE.Uniform(-.8),
        uShadowHigh: new THREE.Uniform(1.5),
        uLightLow: new THREE.Uniform(.5),
        uLightHigh: new THREE.Uniform(1.5),
    }
})

gui.addColor(materialParameters, 'color').onChange(() => {
    material.uniforms.uColor.value.set(materialParameters.color)
})
gui.add(material.uniforms.uShadowRepetitions, 'value').min(1).max(200).step(.0001).name('uShadowRepetitions')
gui.add(material.uniforms.uLightRepetitions, 'value').min(1).max(200).step(.0001).name('uLightRepetitions')

gui.add(material.uniforms.uShadowLow, 'value').min(-3).max(1.5).step(.0001).name('uShadowLow')
gui.add(material.uniforms.uShadowHigh, 'value').min(-.5).max(3).step(.0001).name('uShadowHigh')
gui.add(material.uniforms.uLightLow, 'value').min(-3).max(1.5).step(.0001).name('uLightLow')
gui.add(material.uniforms.uLightHigh, 'value').min(-.5).max(3).step(.0001).name('uLightHigh')


/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = - 3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load(
    '/suzanne.glb',
    (gltf) => {
        suzanne = gltf.scene
        suzanne.traverse((child) => {
            if (child.isMesh)
                child.material = material
        })
        scene.add(suzanne)
    }
)

// light (fake object lol)
gui.add(debug.direction, 'x').min(-Math.PI).max(Math.PI).step(0.0001).onChange(() => {
    material.uniforms.uDirection.value.x = debug.direction.x
})
gui.add(debug.direction, 'y').min(-Math.PI).max(Math.PI).step(0.0001).onChange(() => {
    material.uniforms.uDirection.value.y = debug.direction.y
})
gui.add(debug.direction, 'z').min(-Math.PI).max(Math.PI).step(0.0001).onChange(() => {
    material.uniforms.uDirection.value.z = debug.direction.z
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Rotate objects
    if (suzanne) {
        suzanne.rotation.x = - elapsedTime * 0.1
        suzanne.rotation.y = elapsedTime * 0.2
    }
    
    sphere.rotation.x = - elapsedTime * 0.1
    sphere.rotation.y = elapsedTime * 0.2
    
    torusKnot.rotation.x = - elapsedTime * 0.1
    torusKnot.rotation.y = elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()