import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'
import Stats from 'stats.js'

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
/**
 * Debug
 */
const debugObject = {}
const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Sound
const hitSound = new Audio('/sounds/hit.mp3')
const playHitSound = (collision) => {
    const impact = collision.contact.getImpactVelocityAlongNormal()
    if (impact > 1.5) {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMap/0/px.png',
    '/textures/environmentMap/0/nx.png',
    '/textures/environmentMap/0/py.png',
    '/textures/environmentMap/0/ny.png',
    '/textures/environmentMap/0/pz.png',
    '/textures/environmentMap/0/nz.png'
])

/**
 * Physics
 */
const world = new CANNON.World()
// world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

// materials
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: .1,
    restitution: .7
})
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    shape: floorShape,
    mass: 0, // 0: static object, also default value so we can ommit it
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * .5)
world.addBody(floorBody)


/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({
        color: 'darkcyan',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize = new THREE.Vector2(8192, 8192);
directionalLight.shadow.camera.far = 800;
directionalLight.shadow.camera.top = 50
directionalLight.shadow.camera.bottom = -50
directionalLight.shadow.camera.left = -50
directionalLight.shadow.camera.right = 50
directionalLight.color = new THREE.Color('blanchedalmond')

directionalLight.position.set(40, 20, 20)
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
camera.position.set(-10, 10, 10)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({ metalness: .3, roughness: .4, envMap: environmentMapTexture })

const createSphere = (radius, position) => {
    // mesh
    const mesh = new THREE.Mesh( sphereGeometry, sphereMaterial )
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // body
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        shape: shape,
        mass: 1,
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // append to objects to update
    objectsToUpdate.push({ mesh: mesh, body: body })
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({ metalness: .7, roughness: .1, envMap: environmentMapTexture })

const createBox = (length, position, rotation) => {
    // mesh
    const mesh = new THREE.Mesh( boxGeometry, boxMaterial )
    mesh.scale.set(length, length, length)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.copy(position)
    mesh.quaternion.copy(rotation)
    scene.add(mesh)

    // body
    const shape = new CANNON.Box(new CANNON.Vec3(length/2, length/2, length/2))
    const body = new CANNON.Body({
        shape: shape,
        mass: 1
    })
    body.position.copy(position)
    body.quaternion.copy(rotation)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // append to objects to update
    objectsToUpdate.push({ mesh: mesh, body: body })
}

debugObject.radius = .5
debugObject.length = 1
debugObject.position = { x: 0, y: 1, z: 0 }
debugObject.rotation = new THREE.Quaternion().random()
debugObject.createSphere = () => {
    createSphere(debugObject.radius, debugObject.position)
    debugObject.radius = Math.random()
    debugObject.position.x = (Math.random() - .5) * 10
    debugObject.position.y = Math.random() * 7
    debugObject.position.z = (Math.random() - .5) * 10
}
debugObject.createBox = () => {
    createBox(debugObject.length, debugObject.position, debugObject.rotation)
    debugObject.length = Math.random() * 1.5
    debugObject.position.x = (Math.random() - .5) * 10
    debugObject.position.y = Math.random() * 7
    debugObject.position.z = (Math.random() - .5) * 10
    debugObject.rotation.random()
}
gui.add(debugObject, 'radius').min(0.1).max(1).step(0.0001).listen()
gui.add(debugObject.position, 'x').min(-5).max(5).step(0.0001).listen()
gui.add(debugObject.position, 'y').min(1).max(5).step(0.0001).listen()
gui.add(debugObject.position, 'z').min(-5).max(5).step(0.0001).listen()

gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')

debugObject.reset = () => {
    for (const object of objectsToUpdate) {
        object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)

        scene.remove(object.mesh)
    }
}
gui.add(debugObject, 'reset')

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update physics world
    world.step(1/60, deltaTime, 3)

    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    
    stats.end()
}

tick()