import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


const debugObject = {}

// GUI
const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Textures
const textureLoader = new THREE.TextureLoader()

const doorAlphaTexture = textureLoader.load('/textures/door/alpha.webp')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.webp')
const doorColorTexture = textureLoader.load('/textures/door/color.webp')
const doorHeightTexture = textureLoader.load('/textures/door/height.webp')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.webp')
const doorNormalTexture = textureLoader.load('/textures/door/normal.webp')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.webp')
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
const gradientTexture = textureLoader.load('/textures/gradients/1.jpg')

doorColorTexture.colorSpace = THREE.SRGBColorSpace
matcapTexture.colorSpace = THREE.SRGBColorSpace


// Font loader
const fontLoader = new FontLoader()

fontLoader.load('./fonts/optimer_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry(
        "Hello World!",
        {
            font: font,
            size: 0.5,
            depth: 0.2,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 6,
        }
    )

    textGeometry.center()

    const textMaterial = new THREE.MeshBasicMaterial()
    textMaterial.map = matcapTexture
    const text = new THREE.Mesh(textGeometry, textMaterial)
    text.position.y = 1.3
    scene.add(text)
    objects.push(text) // to make it rotate lol
})



/**
 * Objects
 */
// const material = new THREE.MeshNormalMaterial()
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture
// material.map = doorColorTexture
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0xfff)
// const material = new THREE.MeshStandardMaterial()
const material = new THREE.MeshPhysicalMaterial()
material.metalness = .5
material.roughness = .5
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
material.map = doorColorTexture
material.aoMap = doorAmbientOcclusionTexture
material.aoMapIntensity = 1
material.displacementMap = doorHeightTexture
material.displacementScale = .1
material.metalnessMap = doorMetalnessTexture
material.roughnessMap = doorRoughnessTexture
material.normalMap = doorNormalTexture
material.transparent = true
material.alphaMap = doorAlphaTexture
// material.clearcoat = 1
// material.clearcoatRoughness = 0
// gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.0001)
// gui.add(material, 'sheen').min(0).max(1).step(0.0001)
// material.sheen = 1
// material.sheenRoughness = 0
// material.sheenColor.set(1, 1 ,1)
// gui.add(material, 'sheen').min(0).max(1).step(0.0001)
// gui.add(material, 'sheenRoughness').min(0).max(1).step(0.0001)
// gui.addColor(material, 'sheenColor')
// material.iridescence = 1
// material.iridescenceIOR = 1
// material.iridescenceThicknessRange = [ 100, 800 ]
// gui.add(material, 'iridescence').min(0).max(1).step(0.0001)
// gui.add(material, 'iridescenceIOR').min(0).max(1).step(0.0001)
// gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1)
// gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1)
material.transmission = 0
material.ior = 1
material.thickness = 0
gui.add(material, 'transmission').min(0).max(1).step(0.0001)
gui.add(material, 'ior').min(1).max(10).step(0.0001)
gui.add(material, 'thickness').min(0).max(1).step(0.0001)



const axesHelper = new THREE.AxesHelper(1.5)
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material)
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4, 100, 100), material)
const torus = new THREE.Mesh(new THREE.TorusGeometry(.8, .4, 64, 128), material)

const objects = [sphere, plane, torus]

sphere.position.x = -2
torus.position.x = 2
scene.add(axesHelper, sphere, plane, torus)

// Lights
debugObject.ambientLight = true
debugObject.pointLight = true

const ambientLight = new THREE.AmbientLight('yellow', 1)
const pointLight = new THREE.PointLight('red', 30)
pointLight.position.set(2, 3, 4)
scene.add(ambientLight)
scene.add(pointLight)

const lightsFolder = gui.addFolder('lights')
lightsFolder.add(debugObject, 'ambientLight').onChange((b) => { ambientLight.visible = b })
lightsFolder.add(ambientLight, 'intensity').min(0).max(10).step(0.0001)
lightsFolder.addColor(ambientLight, 'color')
lightsFolder.add(debugObject, 'pointLight').onChange((b) => { pointLight.visible = b })
lightsFolder.add(pointLight, 'intensity').min(0).max(100).step(0.0001)
lightsFolder.addColor(pointLight, 'color')


// Environment map
const rgbeLoader = new RGBELoader()
let environmentMap_ = null
rgbeLoader.load('/textures/environmentMap/2k.hdr', (environmentMap) => {
    environmentMap_ = environmentMap
    environmentMap_.mapping = THREE.EquirectangularReflectionMapping
    scene.background = environmentMap_
    scene.environment = environmentMap_
})

debugObject.useHdr = true
gui.add(debugObject, 'useHdr').onChange((b) => {
    if (b) {
        scene.background = environmentMap_
        scene.environment = environmentMap_
    } else {
        scene.background = null
        scene.environment = null
    }
})


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
    const elapsedTime = clock.getElapsedTime()

    objects.forEach(obj => {
        obj.rotation.x = -elapsedTime * .15
        obj.rotation.y = elapsedTime * .1
    });

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()