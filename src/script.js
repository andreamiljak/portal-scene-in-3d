import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()


/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked_final.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Material
 */
//baked material
const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture} )
/**
 * portal Light material
 */
const portalLightMaterial = new THREE.MeshBasicMaterial({color: 0x4a53ff})

/**
 * 
 * Pole light material
 */
const polelightMaterial= new THREE.MeshBasicMaterial({color: 0xFF694AF})

/**
 * Model
 * 
 */

gltfLoader.load(
    'portalll.glb',
    (gltf)=>
    {
       const  bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const poleLightAMesh = gltf.scene.children.find(child => child.name === 'polelightA')
        const poleLightBMesh = gltf.scene.children.find(child => child.name === 'polelightB')
        const portalLight = gltf.scene.children.find(child => child.name === 'portal')
        
        bakedMesh.material = bakedMaterial
        poleLightAMesh.material = polelightMaterial
        poleLightBMesh.material = polelightMaterial
       portalLight.material = portalLightMaterial

       scene.add(gltf.scene)

    }
)


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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.rotateSpeed = 0.3
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI / 2 - 0.1
controls.minAzimuthAngle = 0; 
controls.maxAzimuthAngle = Math.PI ;
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const slowDownAtLimits = (elapsedTime) => {
    const polarAngle = controls.getPolarAngle(); 
    const azimuthAngle = controls.getAzimuthalAngle(); 

    if (polarAngle < 0.1 || polarAngle > Math.PI / 2 - 0.1) {
        
        controls.dampingFactor = 0.01;
    } else {
        controls.dampingFactor = 0.05;  
    }


    if (azimuthAngle < 0.1 || azimuthAngle > Math.PI - 0.1) {
        
        controls.dampingFactor = 0.01;  
    } else {
        controls.dampingFactor = 0.05;  
    }
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    slowDownAtLimits(elapsedTime)
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()