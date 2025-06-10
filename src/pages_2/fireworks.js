import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/fireworks/vertex.glsl'
import fragmentShader from './shaders/fireworks/fragment.glsl'
import gsap from 'gsap'

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

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
camera.position.set(6, 0, 6)
camera.lookAt(new THREE.Vector3(0,0,0))
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Environment map
const cubeTexture = new THREE.CubeTextureLoader()
const path = '/environmentMaps/2'
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
scene.environmentIntensity = 1
scene.backgroundIntensity = .1

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Fireworks
 */
const textures = [
    textureLoader.load('/textures/particles/1.png'),
    textureLoader.load('/textures/particles/2.png'),
    textureLoader.load('/textures/particles/3.png'),
    textureLoader.load('/textures/particles/4.png'),
    textureLoader.load('/textures/particles/5.png'),
    textureLoader.load('/textures/particles/6.png'),
    textureLoader.load('/textures/particles/7.png'),
    textureLoader.load('/textures/particles/8.png'),
    textureLoader.load('/textures/particles/9.png'),
    textureLoader.load('/textures/particles/10.png'),
    textureLoader.load('/textures/particles/11.png'),
    textureLoader.load('/textures/particles/12.png'),
    textureLoader.load('/textures/particles/13.png'),
]

const createFireworks = (count, position, size, texture, radius, color) => {
    // Geometry
    const particlePositions = new Float32Array(count * 3)
    const particleSizes = new Float32Array(count)
    const timeMultipliers = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        const i3 = i * 3

        const spherical = new THREE.Spherical(
            radius * (.75 + Math.random() * .25),
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2,
        )

        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)


        particlePositions[i3] =     position.x
        particlePositions[i3 + 1] = position.y
        particlePositions[i3 + 2] = position.z


        particleSizes[i] = Math.random()

        timeMultipliers[i] = 1 + Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(particleSizes, 1))
    geometry.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1))

    // Material
    texture.flipY = false
    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(size),
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform(color),
            uProgress: new THREE.Uniform(0)
        }
    })

    const fireworks = new THREE.Points(geometry, material)
    fireworks.position.copy(position)
    scene.add(fireworks)

    // Destroy
    const destroy = () => {
        scene.remove(fireworks)
        geometry.dispose()
        material.dispose()
    }

    // Animate
    gsap.to(
        material.uniforms.uProgress,
        { value: 1, duration: 3, ease: 'linear', onComplete: destroy }
    )
}

const createRandomFireWorks = () => {
    const count = Math.round(400 + Math.random() * 1000)
    const position = new THREE.Vector3((Math.random() - .5) * 4 + .5, Math.random(), (Math.random() - .5) * 4 + .5)
    const size = 0.1 + Math.random() * .9
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = Math.random() + .5
    const color = new THREE.Color().setHSL(Math.random(), 1, .7)
    createFireworks(count, position, size, texture, radius, color)
}


createRandomFireWorks()


window.addEventListener('click', 
createRandomFireWorks)


/**
 * Animate
 */
controls.autoRotate = true
controls.autoRotateSpeed = .5
const tick = () => {
    // Update controls
    controls.update()

    // camera.position.setFromSpherical(spherical)
    // camera.lookAt(new THREE.Vector3(0, 0, 0))

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()