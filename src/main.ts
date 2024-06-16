import './style.css';
import {WorkerManager} from "./Engine/Browser/WorkerManager.ts";
import {Config} from "./Engine/Type/Config.ts";

// const canvas = document.querySelector('canvas');
// if (!canvas) {
//     throw new Error('No canvas found');
// }
//
// const ctx = canvas.getContext('2d');
// if (!ctx) {
//     throw new Error('No 2D context available');
// }

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

const config: Config = {
    world: {
        width: 100,
        height: 100,
    },
    chunks: {
        size: 5,
    },
    simulation: {
        fps: 30,
        particleSize: 5,
    },
    worker: {
        canvasIdentifier: 'canvas#offscreen',
    },
    debug: {
        draw: false,
        stats: true,
        fillerOffset: 25,
        fillerLimit: -1,
    }
};

if (!config.worker) {
    throw new Error('no worker?');
}

const canvas = document.querySelector<HTMLCanvasElement>(config.worker.canvasIdentifier);
if (!canvas) {
    throw new Error('No canvas found');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

new WorkerManager(config);

// const world = new SimpleWorldBuilder().build(config);
//
// const simulator = new Simulator(world, ObviousNonsenseBehaviourManager);
//
// const renderer = new CanvasRenderer(world, config.simulation.particleSize, undefined, undefined, config.debug?.draw);
//
// const stats: Stats | undefined = config.debug && config?.debug?.stats ? new Stats({
//     width: 100,
//     height: 60,
//     // width: 80,
//     // height: 48,
//     showAll: true,
//     defaultPanels: {
//         MS: {
//             decimals: 1,
//             maxValue: 25,
//         },
//     }
// }) : undefined;
//
// if (config.debug && config?.debug?.stats && stats) {
//     document.body.appendChild(stats.dom);
// }
//
// new FrameRateManager(() => {
//     simulator.update();
//
//     stats?.begin();
//     renderer.draw(ctx);
//     stats?.end();
// }, config.simulation.fps);
