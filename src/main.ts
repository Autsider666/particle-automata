import './style.css';
import {ObviousNonsenseBehaviourManager} from "./Engine/Behaviour/ObviousNonsenseBehaviourManager.ts";
import {CanvasRenderer} from "./Engine/Grid/CanvasRenderer.ts";
import {World} from "./Engine/Grid/World.ts";
import {ParticleType} from "./Engine/Particle/ParticleType.ts";
import {Simulator} from "./Engine/Simulator.ts";
import {BoundingBox} from "./Engine/Utility/Excalibur/BoundingBox.ts";

const canvas = document.querySelector('canvas');
if (!canvas) {
    throw new Error('No canvas found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('No 2D context available');
}

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

const squareWorldSize: number = 150;

const bounds = BoundingBox.fromDimension(squareWorldSize, squareWorldSize);
const world = new World(bounds, 10); //TODO add outer bounds

world.iterateParticles((_particle, coordinate) => {
    const {x, y} = coordinate;
    if (x === 1) {
        return;
    }

    if (x === bounds.left || x === bounds.right - 1 || y === bounds.top || y === bounds.bottom - 1) {
        world.setParticle(coordinate, ParticleType.Stone);
    }
}, true);

const simulator = new Simulator(world, ObviousNonsenseBehaviourManager);

const renderer = new CanvasRenderer(world, 5);

const fpsInterval = 1000 / 1000;
let then: number = 0;
let elapsed: number = 0;

const centerX = Math.round(squareWorldSize / 2);
const centerOffset: number = 10;

const step = () => {
    const now = Date.now();
    elapsed = now - then;

    const nextStep = elapsed > fpsInterval;
    if (nextStep) {

        then = now - (elapsed % fpsInterval);

        simulator.update();
        renderer.draw(ctx);

        world.iterateParticles((_particle, coordinate) => {
            const {x, y} = coordinate;
            if (x > centerX - centerOffset && x < centerX + centerOffset && y === 1) {
                world.setParticle(coordinate, ParticleType.Sand);
            }
        }, true);
    }

    requestAnimationFrame(step);
};

step();

