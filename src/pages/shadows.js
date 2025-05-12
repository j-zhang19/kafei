import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'stats.js'

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// Textures
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/shadows/bakedShadow.png')
const simpleShadow = textureLoader.load('/textures/shadows/simpleShadow.jpg')

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
const ambientLight = new THREE.AmbientLight(0xffffff, .3)
const ambientLight_f = gui.addFolder('ambient light').close()
ambientLight_f.add(ambientLight, 'visible')
ambientLight_f.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, .3)
directionalLight.position.set(2, 2, - 1)
const directionalLight_f = gui.addFolder('directional light').close()
directionalLight_f.add(directionalLight, 'visible')
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

// Spotlight
const spotlight = new THREE.SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3)
spotlight.position.set(0, 2, 2)
const spotlight_f = gui.addFolder('spotlight').close()
spotlight_f.add(spotlight, 'visible').setValue(false)
spotlight_f.add(spotlight, 'intensity').min(0).max(20).step(0.001)

scene.add(spotlight)
scene.add(spotlight.target)

const spotlightHelper = new THREE.SpotLightHelper(spotlight)
scene.add(spotlightHelper)
spotlight_f.add(spotlightHelper, 'visible').name('helper').setValue(false)

const spotlightCameraHelper = new THREE.CameraHelper(spotlight.shadow.camera)
const spotlightCameraHelper_f = spotlight_f.addFolder('spotlightCamera')
spotlightCameraHelper_f.add(spotlightCameraHelper, 'visible').name('shadow camera helper').setValue(false)
scene.add(spotlightCameraHelper)

// Point light
const pointLight = new THREE.PointLight(0xffffff, 2)
pointLight.position.set(-1, 1, 0)
const pointLight_f = gui.addFolder('point light')
pointLight_f.add(pointLight, 'visible')
pointLight_f.add(pointLight, 'intensity').min(0).max(10).step(0.0001)
pointLight.castShadow = true
scene.add(pointLight)

const pointLightHelper = new THREE.PointLightHelper(pointLight, .5)
pointLight_f.add(pointLightHelper, 'visible').name('helper').setValue(false)
scene.add(pointLightHelper)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLight_f.add(pointLightCameraHelper, 'visible').name('camera helper').setValue(false)
scene.add(pointLightCameraHelper)



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
    // new THREE.MeshBasicMaterial({ map: bakedShadow })
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

// sphereShadow
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        alphaMap: simpleShadow
    })
)

sphereShadow.rotation.x = -Math.PI * .5
sphereShadow.position.y = plane.position.y + .01



scene.add(sphere, plane, sphereShadow)

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
directionalLight_f.add(directionalLight.shadow, 'radius').min(0).max(40).step(0.0001)

const directionalLightCamera_f = directionalLight_f.addFolder('directionalLightCamera')
directionalLightCameraHelper.visible = false
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

spotlight.castShadow = true
debugOptions.spotlightShadowCamera_near = spotlight.shadow.camera.near
debugOptions.spotlightShadowCamera_far = spotlight.shadow.camera.far
spotlight_f.add(spotlight.shadow.camera, 'fov').min(0).max(180).onChange((v) => {
    spotlight.shadow.camera.fov = v
    spotlight.angle = v
    updateCamera(spotlight.shadow.camera, spotlightCameraHelper)}).disable()

spotlight_f.add(debugOptions, 'spotlightShadowCamera_near').onFinishChange((v) => {
    spotlight.shadow.camera.near = parseFloat(v)
    updateCamera(spotlight.shadow.camera, spotlightCameraHelper)
})

spotlight_f.add(debugOptions, 'spotlightShadowCamera_far').onFinishChange((v) => {
    spotlight.shadow.camera.far = parseFloat(v)
    updateCamera(spotlight.shadow.camera, spotlightCameraHelper)
})


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
renderer.shadowMap.enabled = false
gui.add(renderer.shadowMap, 'type').options({'BasicShadowMap': THREE.BasicShadowMap, 'PCFShadowMap': THREE.PCFShadowMap, 'PCFSoftShadowMap': THREE.PCFSoftShadowMap, 'VSMShadowMap': THREE.VSMShadowMap})


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // animation
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    sphereShadow.material.opacity = (1-sphere.position.y)* .6
    sphereShadow.scale.set(
        sphereShadow.material.opacity + .2,
        sphereShadow.material.opacity + .2,
        sphereShadow.material.opacity + .2)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()