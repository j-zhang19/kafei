import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { NoColorSpace } from 'three'

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

// Textures
const textureLoader = new THREE.TextureLoader()
// floor
const floorAlphaTexture = textureLoader.load('/textures/floor/alpha.jpg')
const floorColorTexture = textureLoader.load('/textures/floor/stony_dirt/stony_dirt_path_diff_1k.jpg')
const floorARMTexture = textureLoader.load('/textures/floor/stony_dirt/stony_dirt_path_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('/textures/floor/stony_dirt/stony_dirt_path_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('/textures/floor/stony_dirt/stony_dirt_path_disp_1k.jpg')

floorColorTexture.colorSpace = THREE.SRGBColorSpace
floorColorTexture.repeat.set(8, 8)
floorARMTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping
floorARMTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorDisplacementTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping

// wall
const wallColorTexture = textureLoader.load('/textures/wall/stone_tile/stone_tile_wall_diff_1k.jpg')
const wallARMTexture = textureLoader.load('/textures/wall/stone_tile/stone_tile_wall_arm_1k.jpg')
const wallNormalTexture = textureLoader.load('/textures/wall/stone_tile/stone_tile_wall_nor_gl_1k.jpg')
wallColorTexture.repeat.set(3,3)
wallARMTexture.repeat.set(3,3)
wallNormalTexture.repeat.set(3,3)
wallColorTexture.wrapS = THREE.RepeatWrapping
wallColorTexture.wrapT = THREE.RepeatWrapping
wallARMTexture.wrapS = THREE.RepeatWrapping
wallARMTexture.wrapT = THREE.RepeatWrapping
wallNormalTexture.wrapS = THREE.RepeatWrapping
wallNormalTexture.wrapT = THREE.RepeatWrapping

// roof
const roofColorTexture = textureLoader.load('/textures/roof/roof_slates/roof_slates_03_diff_1k.jpg')
const roofARMTexture = textureLoader.load('/textures/roof/roof_slates/roof_slates_03_arm_1k.jpg')
const roofNormalTexture = textureLoader.load('/textures/roof/roof_slates/roof_slates_03_nor_gl_1k.jpg')

roofColorTexture.repeat.set(3, 1)
roofARMTexture.repeat.set(3, 1)
roofNormalTexture.repeat.set(3, 1)

roofColorTexture.wrapS = THREE.RepeatWrapping
roofARMTexture.wrapS = THREE.RepeatWrapping
roofNormalTexture.wrapS = THREE.RepeatWrapping

// bush
const bushColorTexture = textureLoader.load('/textures/leaves_forest_ground/leaves_forest_ground_diff_1k.jpg')
const bushARMTexture = textureLoader.load('/textures/leaves_forest_ground/leaves_forest_ground_arm_1k.jpg')
const bushNormalTexture = textureLoader.load('/textures/leaves_forest_ground/leaves_forest_ground_nor_gl_1k.jpg')

bushColorTexture.repeat.set(2, 2)
bushARMTexture.repeat.set(2, 2)
bushNormalTexture.repeat.set(2, 2)
bushColorTexture.wrapS = THREE.RepeatWrapping
bushARMTexture.wrapS = THREE.RepeatWrapping
bushNormalTexture.wrapS = THREE.RepeatWrapping
bushColorTexture.wrapT = THREE.RepeatWrapping
bushARMTexture.wrapT = THREE.RepeatWrapping
bushNormalTexture.wrapT = THREE.RepeatWrapping

// grave
const graveColorTexture = textureLoader.load('/textures/plastered_stone/plastered_stone_wall_diff_1k.jpg')
const graveARMTexture = textureLoader.load('/textures/plastered_stone/plastered_stone_wall_arm_1k.jpg')
const graveNormalTexture = textureLoader.load('/textures/plastered_stone/plastered_stone_wall_nor_gl_1k.jpg')

// door
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

doorColorTexture.colorSpace = THREE.SRGBColorSpace

/**
 * House
 */
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.4468,
        displacementBias: -0.2046
    })
)
floor.rotation.x = - Math.PI * .5
gui.add(floor.material, 'displacementScale').min(0).max(1).step(.0001)
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(.0001)

scene.add(floor)


// house
const house = new THREE.Group()
scene.add(house)

const wallTexture = new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    normalMap: wallNormalTexture
})

const walls = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 4),
    wallTexture
)
walls.position.y = .5 + 1.5
house.add(walls)

const stairs_ = new THREE.Mesh(
    new THREE.BoxGeometry(5, .25, 6),
    wallTexture
)
stairs_.position.y = .125
const stairs = new THREE.Mesh(
    new THREE.BoxGeometry(4, .5, 5),
    wallTexture
)
stairs.position.y = .25
house.add(stairs_, stairs)

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture
    })
)
roof.position.y = .5 + 3 + .75
roof.rotation.y = Math.PI * .25
house.add(roof)

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 50, 50),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        aoMap: doorAmbientOcclusionTexture,
        alphaMap: doorAlphaTexture,
        roughnessMap: doorRoughnessTexture,
        metalnessMap: doorMetalnessTexture,
        normalMap: doorNormalTexture,
        displacementMap: doorHeightTexture,
        displacementBias: -0.04,
        displacementScale: .15,
        transparent: true
    })
)
door.position.y = 1.5
door.position.z = 2 + .001
house.add(door)

// bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: 0xccffcc,
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture
})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(.3, .4, .4)
bush1.position.set(1.7, .7, .2)
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(.4, 1, .5)
bush2.position.set(1.6, 1, 1)
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(.3, .4, .4)
bush3.position.set(-1.7, .7, .2)
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(.4, 1, .5)
bush4.position.set(-1.6, 1, -1)

house.add(bush1, bush2, bush3, bush4)

// graves
const graveGeometry = new THREE.BoxGeometry(.6, .8, .2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture
})

const graves = new THREE.Group()
scene.add(graves)

for (let i = 0; i < 40; i++) {
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    graves.add(grave)

    const angle = Math.random() * Math.PI * 2
    const radius = 4.1 + Math.random() * 4.9
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    grave.position.set(x, .1 + Math.random() * .41, z)
    grave.rotation.set(
        (Math.random() - .5) * .4,
        (Math.random() - .5) * .4,
        (Math.random() - .5) * .4)

}




/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()