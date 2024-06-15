import './style.css';
import {ObviousNonsenseBehaviourManager} from "./Engine/Behaviour/ObviousNonsenseBehaviourManager.ts";
import {CanvasRenderer} from "./Engine/Grid/CanvasRenderer.ts";
import {World} from "./Engine/Grid/World.ts";
import {ParticleType} from "./Engine/Particle/ParticleType.ts";
import {Simulator} from "./Engine/Simulator.ts";
import {BoundingBox} from "./Engine/Utility/Excalibur/BoundingBox.ts";
import Stats from "./Utility/Stats/Stats.ts";

const canvas = document.querySelector('canvas');
if (!canvas) {
    throw new Error('No canvas found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('No 2D context available');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particleSize: number = 4;
const debug: boolean = true;

const initialWorldBounds = BoundingBox.fromDimension(480, 230);
const world = new World(initialWorldBounds, 10); //TODO add outer bounds

world.iterateParticles((_particle, coordinate) => {
    const {x, y} = coordinate;
    // if (x === 1) {
    //     return;
    // }

    if (x === initialWorldBounds.left || x === initialWorldBounds.right - 1 || y === initialWorldBounds.top || y === initialWorldBounds.bottom - 1) {
        world.setParticle(coordinate, ParticleType.Stone);
    }
}, true);

const simulator = new Simulator(world, ObviousNonsenseBehaviourManager);

const renderer = new CanvasRenderer(world, particleSize, undefined, undefined, debug);

const fpsInterval = 1000 / 1000;
let then: number = 0;
let elapsed: number = 0;

const centerX = Math.round(initialWorldBounds.width / 2);
const centerOffset: number = 10;

const stats: Stats | undefined = debug ? new Stats({
    width: 100,
    height: 60,
    // width: 80,
    // height: 48,
    showAll: true,
    defaultPanels: {
        MS: {
            decimals: 1,
            maxValue: 25,
        },
    }
}) : undefined;

if(debug && stats) {
    document.body.appendChild(stats.dom);
}

const step = () => {
    const now = Date.now();
    elapsed = now - then;

    const nextStep = elapsed > fpsInterval;
    if (nextStep) {

        then = now - (elapsed % fpsInterval);

        stats?.begin();
        simulator.update();
        stats?.end();

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

