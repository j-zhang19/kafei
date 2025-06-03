import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import { Sky } from 'three/addons/objects/Sky.js'

/**
 * Base
 */
// Debug
const debugObject = {}

debugObject.depthColor = '#0008ff '
debugObject.surfaceColor = '#00a6ff'


const gui = new GUI({ width: 340 })
gui.add({ home: () => window.location.href = '/index.html' }, 'home').name('🏠 Go to main page');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(100, 100, 512, 512)

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: { value: 0 },

        uWavesElevation: { value: 0.25 },
        uWavesFrequency: { value: new THREE.Vector2(0.4332, 0.6652) },
        uWavesSpeed: { value: .7 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 1 },
        uColorMultiplier: { value: .9 },

        uPerlinWavesElevation: { value: 0.05 },
        uPerlinWavesFrequency: { value: 25 },
        uPerlinWavesSpeed: { value: 2.5 },
        uPerlinWavesIterations: { value: 5 },

        uFogDensity: { value: 0.02 }, // Will be updated in tick()
        uFogColor: { value: new THREE.Color('#fbffdb') }
        
    },
})

// Tweaks
gui.add(waterMaterial.uniforms.uWavesElevation, 'value').min(0.0).max(1).step(0.0001).name('uWavesElevation')
gui.add(waterMaterial.uniforms.uWavesFrequency.value, 'x').min(0.0).max(10).step(0.0001).name('uWavesFrequencyX')
gui.add(waterMaterial.uniforms.uWavesFrequency.value, 'y').min(0.0).max(10).step(0.0001).name('uWavesFrequencyZ')
gui.add(waterMaterial.uniforms.uWavesSpeed, 'value').min(0.0).max(5).step(0.0001).name('uWavesSpeed')

gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0.0).max(1).step(0.0001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0.0).max(10).step(0.0001).name('uColorMultiplier')

gui.add(waterMaterial.uniforms.uPerlinWavesElevation, 'value').min(0.0).max(1).step(0.0001).name('uPerlinWavesElevation')
gui.add(waterMaterial.uniforms.uPerlinWavesFrequency, 'value').min(0.0).max(30).step(0.0001).name('uPerlinWavesFrequency')
gui.add(waterMaterial.uniforms.uPerlinWavesSpeed, 'value').min(0.0).max(4).step(0.0001).name('uPerlinWavesSpeed')
gui.add(waterMaterial.uniforms.uPerlinWavesIterations, 'value').min(0.0).max(5).step(1).name('uPerlinWavesIterations')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

// Fog
const fogColor = '#fbffdb';
const fogDensity = 0.112; // Adjust density as needed
scene.fog = new THREE.FogExp2(fogColor, fogDensity);
scene.background = new THREE.Color('lightblue');

// Add GUI for fog
debugObject.fogColor = fogColor;
debugObject.fogDensity = fogDensity;

gui.addColor(debugObject, 'fogColor').onChange(() => {
    scene.fog.color.set(debugObject.fogColor);
}).name('Fog Color');
gui.add(debugObject, 'fogDensity').min(0.0).max(0.5).step(0.001).onChange(() => {
    scene.fog.density = debugObject.fogDensity;
}).name('Fog Density');


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
camera.position.set(1, 1, 1)
// camera.rotation.set(new THREE.Euler(90, 90, 0))
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

camera.rotation.set( 
    -0.7724775282908556,
    0.8046818233140514,
    0.6122177710978001)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Sky
const sky = new Sky()
sky.scale.set(100, 100, 100)
sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(-1, -0.038, -0.4)
scene.add(sky)



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update fog uniforms in the shader material
    // This is crucial for the ShaderMaterial to correctly apply fog
    if (scene.fog) {
        waterMaterial.uniforms.uFogDensity.value = scene.fog.density;
        waterMaterial.uniforms.uFogColor.value.copy(scene.fog.color);
    }

    // Update controls
    // controls.update()
    // console.log(camera.rotation)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()