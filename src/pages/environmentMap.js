import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const debugOptions = {}
const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

// Loaders
const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
    gltf.scene.scale.set(10, 10, 10)
    scene.add(gltf.scene)
})

const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader()



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Environment map
const cubeTexture = new THREE.CubeTextureLoader()

const setCubeEnvMap = (path) => {
    scene.environment.dispose()
    scene.background.dispose()
    const environmentMap = cubeTexture.load([
        path + '/px.png',
        path + '/nx.png',
        path + '/py.png',
        path + '/ny.png',
        path + '/pz.png',
        path + '/nz.png',
    ])
    scene.environment = environmentMap
    scene.background = environmentMap
    scene.environmentIntensity = 4
    scene.backgroundIntensity = 5
}

// rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
    
//     scene.background = environmentMap
//     scene.environment = environmentMap
// })

const setHDRIEnvMap = (path) => {
    rgbeLoader.load(path + '/2k.hdr', (environmentMap) => {
        scene.environment.dispose()
        scene.background.dispose()

        environmentMap.mapping = THREE.EquirectangularReflectionMapping
        
        if (debugOptions.useSkybox) {
            const skybox = new GroundedSkybox(environmentMap, 15, 70)
            skybox.position.y = 15
            scene.add(skybox)
        } else {
            scene.background = environmentMap
        }
        scene.environment = environmentMap
    })
}

const setTextureEnvMap = (filename) => {
    scene.background.dispose()
    scene.environment.dispose()

    const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/' + filename + '.jpg')
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    environmentMap.colorSpace = THREE.SRGBColorSpace

    scene.background = environmentMap
    scene.environment = environmentMap
    scene.environmentIntensity = 4
    scene.backgroundIntensity = 5
}

const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace
scene.background = environmentMap
scene.environment = environmentMap
scene.environmentIntensity = 1
scene.backgroundIntensity = 1



debugOptions.HDRIEnvMap = 0
debugOptions.cubeEnvMap = 0
debugOptions.textureEnvMap = 0
debugOptions.lockRotation = false
debugOptions.useSkybox = false

gui.add(debugOptions, 'useSkybox')
gui.add(debugOptions, 'HDRIEnvMap').options(['0', '1', '2']).onFinishChange((v) => (setHDRIEnvMap('/environmentMaps/'+v))).name('HDRIEnvMaps')
gui.add(debugOptions, 'cubeEnvMap').options(['0', '1', '2']).onFinishChange((v) => (setCubeEnvMap('/environmentMaps/'+v))).name('cubeEnvMaps')
gui.add(debugOptions, 'textureEnvMap').options({
    '0': 'anime_art_style_japan_streets_with_cherry_blossom_',
    '1': 'digital_painting_neon_city_night_orange_lights_',
    '2': 'fantasy_lands_castles_at_night',
    '3': 'interior_views_cozy_wood_cabin_with_cauldron_and_p',
    '4': 'scifi_white_sky_scrapers_in_clouds_at_day_time'
}).onFinishChange((v)=>(setTextureEnvMap(v)))
gui.add(scene, 'environmentIntensity').min(1).max(10).step(0.0001).listen()
gui.add(scene, 'backgroundIntensity').min(1).max(10).step(0.0001).listen()
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.0001).listen()
gui.add(debugOptions, 'lockRotation')
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.0001).name('backgroundRotationY').onChange(() => {
    if (debugOptions.lockRotation)
        scene.environmentRotation.y = scene.backgroundRotation.y
}).listen()
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.0001).name('environmentRotationY').onChange(() => {
    if (debugOptions.lockRotation)
        scene.backgroundRotation.y = scene.environmentRotation.y
}).listen()


// Donut
const donut = new THREE.Mesh(
    new THREE.TorusGeometry(8, .5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 10) })
)
donut.position.y = 3.5
scene.add(donut)
donut.layers.enable(1)

const donut_ = new THREE.Mesh(
    new THREE.TorusGeometry(19, .5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 2, 1) })
)
donut_.position.y = 3.5
scene.add(donut_)
donut_.layers.enable(1)

// Cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
const cubeCamera = new THREE.CubeCamera(.1, 100, cubeRenderTarget)
cubeCamera.layers.set(1)

scene.environment = cubeRenderTarget.texture

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, color: 0xaaaaaa })
)

torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Rotation
    if (donut) {
        donut.rotation.x = Math.sin(elapsedTime) * 2
        donut_.rotation.y = Math.sin(elapsedTime * .5) * 2
        donut_.rotation.x = Math.sin(elapsedTime) * 2
        cubeCamera.update(renderer, scene)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()