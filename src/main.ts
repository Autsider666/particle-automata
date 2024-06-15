import './style.css';
import {ObviousNonsenseBehaviourManager} from "./Engine/Behaviour/ObviousNonsenseBehaviourManager.ts";
import {CanvasRenderer} from "./Engine/Grid/CanvasRenderer.ts";
import {World} from "./Engine/Grid/World.ts";
import {ParticleType} from "./Engine/Particle/ParticleType.ts";
import {Simulator} from "./Engine/Simulator.ts";
import {BoundingBox} from "./Engine/Utility/Excalibur/BoundingBox.ts";
import {FrameRateManager} from "./Utility/FrameRateManager.ts";
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

type Config = {
    world: {
        width: number,
        height: number,
    },
    chunks: {
        size: number,
    }
    simulation: {
        fps: number,
        particleSize: number,
    },
    debug?: {
        draw?: boolean,
        stats?: boolean,
        fillerOffset?: number,
        fillerLimit?: number,
    },
};

const config: Config = {
    world: {
        width: 200,
        height: 200,
    },
    chunks: {
        size: 25,
    },
    simulation: {
        fps: 100,
        particleSize: 4,
    },
    debug: {
        draw: false,
        stats: true,
        fillerOffset: 10,
        fillerLimit: -1,
    }
};

const initialWorldBounds = BoundingBox.fromDimension(config.world.width, config.world.height);
const world = new World(initialWorldBounds, config.chunks.size); //TODO add outer bounds

world.iterateAllParticles((_particle, coordinate) => {
    const {x, y} = coordinate;
    if (x === initialWorldBounds.left
        || x === initialWorldBounds.right - 1
        // || y === initialWorldBounds.top
        || y === initialWorldBounds.bottom - 1
    ) {
        world.setParticle(coordinate, ParticleType.Stone);
    }
});

const simulator = new Simulator(world, ObviousNonsenseBehaviourManager);

const renderer = new CanvasRenderer(world, config.simulation.particleSize, undefined, undefined, config.debug?.draw);

const centerX = Math.round(initialWorldBounds.width / 2);
const centerOffset: number = config.debug?.fillerOffset ?? 0;
let fillerLimit: number = config.debug?.fillerLimit ?? -1;

const stats: Stats | undefined = config.debug && config?.debug?.stats ? new Stats({
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

if (config.debug && config?.debug?.stats && stats) {
    document.body.appendChild(stats.dom);
}

new FrameRateManager(() => {
    simulator.update();

    if (fillerLimit !== 0) {
        world.iterateAllParticles((_particle, coordinate) => {
            if (fillerLimit === 0) {
                return;
            }

            const {x, y} = coordinate;
            if (x > centerX - centerOffset && x < centerX + centerOffset && y === 0) {
                world.setParticle(coordinate, ParticleType.Sand);
                fillerLimit--;
            }
        });
    }

    stats?.begin();
    renderer.draw(ctx);
    stats?.end();
}, config.simulation.fps);
