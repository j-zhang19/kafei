import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap'
import GUI from 'lil-gui'

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
*/
// AxesHelper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

gui.add(axesHelper, 'visible').name('axes')
gui.add(mesh.position, 'y', -1, 1, 0.01).name('elevation')
gui.add(mesh.material, 'wireframe')

// const group = new THREE.Group()
// for (let index = 0; index < 3; index++) {
//     const cube = new THREE.Mesh(
//         new THREE.BoxGeometry(),
//         new THREE.MeshBasicMaterial({ color: 0xffafaf })
//     )
//     cube.position.set(index, 1-index, 0)
//     group.add(cube)
// }
// scene.add(group)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// window.addEventListener('dblclick', () => {
//     console.log('double click')
//     if (!document.fullscreenElement) {
//         canvas.requestFullscreen()
//     } else {
//         document.exitFullscreen()
//     }
// })


/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(0, 0, 2)
camera.lookAt(new THREE.Vector3(0, 0, 0))
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

// Animation
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    mesh.rotation.y = elapsedTime

    // controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()