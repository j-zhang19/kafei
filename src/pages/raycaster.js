import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new GUI()
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// GLTF Loader
let mixer = null
let foxGltf = null

debugObject.foxAction = 1
gui.add(debugObject, 'foxAction').options({'survey': 0, 'walk': 1, 'run': 2}).onChange((value) => {
    mixer.stopAllAction()
    mixer.clipAction(foxGltf.animations[value]).play()
})

const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
    // gltf.scene.children[0].scale.set(.025, .025, .025)
    // gltf.scene.children[0].rotation.y = Math.PI * .5
    // gltf.scene.children[0].position.y = 1

    mixer = new THREE.AnimationMixer(gltf.scene)
    foxGltf = gltf
    foxGltf.scene.scale.set(.025, .025, .025)
    foxGltf.scene.rotation.y = Math.PI * .5
    foxGltf.scene.position.y = 1

    const action = mixer.clipAction(gltf.animations[1])
    action.play()

    scene.add(gltf.scene)
})

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#fff000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#fff000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#fff000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

object1.updateMatrixWorld()
object2.updateMatrixWorld()
object3.updateMatrixWorld()


// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 1)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight('#ffff00', 3)
scene.add(sunLight)


/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)

// Add a arrow helper to visualize the ray
const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-3, 0, 0), 7, 'blue', .6, .08)
scene.add(arrowHelper)


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
 * Cursor (mouse)
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (_event) => {
    mouse.x = _event.clientX / sizes.width * 2 - 1
    mouse.y = - (_event.clientY / sizes.height * 2 - 1)
})

window.addEventListener('click', (_event) => {
    if (currentIntersect) {
        console.log('clicked on a sphere!')
        switch (currentIntersect.object) {
            case object1:
                object1.material.color.set(new THREE.Color('green'))
                console.log('clicked on object1')
                break;
            case object2:
                object2.material.color.set(new THREE.Color('green'))
                console.log('clicked on object2')
                break;
            case object3:
                object3.material.color.set(new THREE.Color('green'))
                console.log('clicked on object3')
                break;
            case foxGltf.scene:
                console.log('fox')
            default:
                break;
        }
    }
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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
const clock = new THREE.Clock()

// Mouse events
let currentIntersect = null
let previousTime = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update mixer
    if (mixer != null) 
        mixer.update(deltaTime)

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * .3) * 1.5
    object2.position.y = Math.sin(elapsedTime * .8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Raycaster
    const rayOrigin = new THREE.Vector3(-3, 0, 0)
    const rayDirection = new THREE.Vector3(10, 0, 0)
    rayDirection.normalize()

    raycaster.set(rayOrigin, rayDirection)

    const objectsToTest = [object1, object2, object3]
    if (!currentIntersect) {
        objectsToTest.forEach((obj) => {
            obj.material.color.set("#fff000")
        })
    }

    let intersects = raycaster.intersectObjects(objectsToTest)
    for (const intersect of intersects) {
        intersect.object.material.color.set("#000fff")
    }

    
    // Mouse raycaster
    raycaster.setFromCamera(mouse, camera)
    
    intersects = raycaster.intersectObjects(objectsToTest)

    // Mouse events
    if (intersects.length > 0) {
        if (currentIntersect === null) {
            console.log('mouse enter')
        }
        currentIntersect = intersects[0]
    } else {
        if (currentIntersect) {
            console.log('mouse leave')
        }
        currentIntersect = null
    }

    // Raycaster to model
    if (foxGltf) {
        const modelIntersects = raycaster.intersectObject(foxGltf.scene)

        if (modelIntersects.length > 0)
            foxGltf.scene.scale.set(.027, .027, .027)
        else
            foxGltf.scene.scale.set(.025, .025, .025)
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()