import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


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
const bakedMaterial = new THREE.MeshLambertMaterial({map: bakedTexture} )

//GUI controls
const settings = {
    //portalColor: "#4a53ff"   //bez ambijentalnog
   portalColor:"#323cf5",
   poleLightColor: "#ff52a3"
}
const portalLightMaterial = new THREE.MeshStandardMaterial({
    color: settings.portalColor,
    emissive: new THREE.Color(settings.portalColor),
    emissiveIntensity: 2
})

const polelightMaterial = new THREE.MeshStandardMaterial({
    color: settings.poleLightColor,
    emissive: new THREE.Color(settings.poleLightColor),
    emissiveIntensity: 2
 })

//ambijetalno svjetlo da portal moze realisticnije mjenjat boje
/////
const ambientLight = new THREE.AmbientLight(settings.portalColor, 0.4)
scene.add(ambientLight)
const ambientLightpole = new THREE.AmbientLight(settings.poleLightColor, 0.2)
scene.add(ambientLightpole)
const ambientLight1 = new THREE.AmbientLight(0xffffff, 1.5)
scene.add(ambientLight1)
/////

gui.addColor(settings, "poleLightColor").onChange(value => {
    polelightMaterial.color.set(value),
    polelightMaterial.emissive.set(value),

    ambientLightpole.color.set(value)
})

gui.addColor(settings, "portalColor").onChange(value => {
     portalLightMaterial.color.set(value),
     portalLightMaterial.emissive.set(value),
     //
     ambientLight.color.set(value)
     //
})

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