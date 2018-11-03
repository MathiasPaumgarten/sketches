import { bootstrap, draw, options, stop } from "canvas-recorder/gl";
import { AmbientLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";

import { Canvas } from "./canvas";
import { Particles } from "./gl/particles";
// @ts-ignore
import positionShader from "./shaders/position.fragment.glsl";
// @ts-ignore
import velocityShader from "./shaders/velocity.fragment.glsl";

const ambientLight = new AmbientLight( 0x404040 );
const camera = new PerspectiveCamera( 90, 1, 1, 10000 );
const scene = new Scene();
const renderer = new WebGLRenderer( { alpha: false } );
const canvas = new Canvas();
const particles = new Particles( 256, {
    renderer,

    positionShader,
    positionUniforms: {
        mouse: [ 0, 0 ],
    },

    velocityShader,
    velocityUniforms: {
        mouse: [ 0, 0 ],
        fontTexture: canvas.getTexture(),
    },
} );

renderer.setSize( 1024, 1024 );

camera.position.set( 0, 0, -100 );
camera.lookAt( new Vector3() );

scene.add( particles );
scene.add( ambientLight );

canvas.write( "Everybody\npoops" );

let x = -1024;
let y = -1024;

window.addEventListener( "mousemove" , ( event: MouseEvent ) => {
    x = ( 1024 - event.pageX ) / 1024 * 200 - 100;
    y = ( 1024 - event.pageY ) / 1024 * 200 - 100;
} );

stop();
document.body.innerHTML = "";

options( {
    record: true,
    clear: false,
    canvas: renderer.domElement,
    color: "black",
} );

draw( ( gl: WebGLRenderingContext, now: number ) => {
    particles.updateUniform( "mouse", [ x, y ] );
    particles.update( now );

    renderer.render( scene, camera );
} );

bootstrap();

window.stop = stop;

// Debug test image
//
// document.body.appendChild( canvas.getElement() );
