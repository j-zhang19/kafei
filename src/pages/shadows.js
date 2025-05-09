import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'stats.js'

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );


/**
 * Base
 */
// Debug
const debugOptions = {}

const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
const ambientLight_f = gui.addFolder('ambient light').close()
ambientLight_f.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(2, 2, - 1)
const directionalLight_f = gui.addFolder('directional light')
directionalLight_f.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
directionalLight_f.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
directionalLight_f.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
directionalLight_f.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
scene.add(directionalLightHelper)
directionalLightHelper.visible = false
directionalLight_f.add(directionalLightHelper, 'visible').name('helper')

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightCameraHelper)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
const material_f = gui.addFolder('material').close()
material_f.add(material, 'metalness').min(0).max(1).step(0.001)
material_f.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

scene.add(sphere, plane)

// Shadows and tweaks
sphere.castShadow = true
plane.receiveShadow = true
directionalLight.castShadow = true
directionalLight_f.add(directionalLight, 'castShadow').name("castShadow")
gui.add(sphere, 'castShadow').name("sphere.castShadow")
gui.add(plane, 'receiveShadow').name("plane.receiveShadow")
debugOptions.shadowMapSize = 512
directionalLight_f.add(debugOptions, 'shadowMapSize').options([512, 1024, 2048, 4096, 4096*2]).onFinishChange((v) => {
    directionalLight.shadow.mapSize.set(v, v)
    directionalLight.shadow.map.setSize(v, v)
})

const directionalLightCamera_f = directionalLight_f.addFolder('directionalLightCamera')
directionalLightCamera_f.add(directionalLightCameraHelper, 'visible').name('shadow cameraHelper')

function updateCamera(camera, cameraHelper) {
    camera.updateProjectionMatrix()
    cameraHelper.update()
}

debugOptions.directionalLightShadowCamera_near = directionalLight.shadow.camera.near
debugOptions.directionalLightShadowCamera_far = directionalLight.shadow.camera.far
directionalLightCamera_f.add(debugOptions, 'directionalLightShadowCamera_near').onFinishChange((v) => {
    directionalLight.shadow.camera.near = parseFloat(v)
    updateCamera(directionalLight.shadow.camera, directionalLightCameraHelper)
})

directionalLightCamera_f.add(debugOptions, 'directionalLightShadowCamera_far').onFinishChange((v) => {
    directionalLight.shadow.camera.far = parseFloat(v)
    updateCamera(directionalLight.shadow.camera, directionalLightCameraHelper)
})

directionalLightCamera_f.add(directionalLight.shadow.camera, 'top').min(0.1).max(5).onChange((v) => {updateCamera(directionalLight.shadow.camera, directionalLightCameraHelper)})
directionalLightCamera_f.add(directionalLight.shadow.camera, 'right').min(0.1).max(5).onChange((v) => {updateCamera(directionalLight.shadow.camera, directionalLightCameraHelper)})
directionalLightCamera_f.add(directionalLight.shadow.camera, 'bottom').min(-5).max(0-0.1).onChange((v) => {updateCamera(directionalLight.shadow.camera, directionalLightCameraHelper)})
directionalLightCamera_f.add(directionalLight.shadow.camera, 'left').min(-5).max(0-0.1).onChange((v) => {updateCamera(directionalLight.shadow.camera, directionalLightCameraHelper)})



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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 4
camera.fov = 75
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    // console.log(camera.fov)

    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()