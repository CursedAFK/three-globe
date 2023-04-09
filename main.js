import gsap from 'gsap'
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

const canvasContainer = document.getElementById('canvasContainer')

const scene = new Scene()

const camera = new PerspectiveCamera(
  75,
  canvasContainer.offsetWidth / canvasContainer.offsetHeight,
  0.1,
  1000
)

const renderer = new WebGLRenderer({
  antialias: true,
  canvas: document.querySelector('canvas')
})
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(devicePixelRatio)

camera.position.set(0, 0, 15)

const orbit = new OrbitControls(camera, renderer.domElement)

const sphere = new Mesh(
  new SphereGeometry(5, 50, 50),
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new TextureLoader().load('/images/globe.jpg')
      }
    }
  })
)

const atmosphere = new Mesh(
  new SphereGeometry(5, 50, 50),
  new ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: AdditiveBlending,
    side: BackSide
  })
)
atmosphere.scale.set(1.1, 1.1, 1.1)
scene.add(atmosphere)

const group = new Group()
group.add(sphere)
scene.add(group)

const starVertices = []

for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = -Math.random() * 2000

  starVertices.push(x, y, z)
}

const starGeo = new BufferGeometry()
starGeo.setAttribute('position', new Float32BufferAttribute(starVertices, 3))
const stars = new Points(
  starGeo,
  new PointsMaterial({
    color: 0xffffff
  })
)
scene.add(stars)

const mouse = {
  x: undefined,
  y: undefined
}

const animate = () => {
  sphere.rotation.y += 0.002

  gsap.to(group.rotation, {
    x: -mouse.y * 0.3,
    y: mouse.x * 0.5,
    duration: 2
  })

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

addEventListener('resize', () => {
  camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
})

addEventListener('mousemove', e => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1
  mouse.y = -(e.clientY / innerHeight) * 2 + 1
})
