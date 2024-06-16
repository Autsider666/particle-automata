import './style.css';
import {ObviousNonsenseBehaviourManager} from "./Engine/Behaviour/ObviousNonsenseBehaviourManager.ts";
import {WorkerManager} from "./Engine/Browser/WorkerManager.ts";
import {WorldCoordinate} from "./Engine/Grid/World.ts";
import {ParticleType} from "./Engine/Particle/ParticleType.ts";
import {Renderer} from "./Engine/Renderer/Renderer.ts";
import {RendererBuilder} from "./Engine/Renderer/RendererBuilder.ts";
import {Simulator} from "./Engine/Simulator.ts";
import {Config} from "./Engine/Type/Config.ts";
import {RenderMode} from "./Engine/Type/RenderMode.ts";
import {WorkerMessage} from "./Engine/Type/WorkerMessage.ts";
import {SimpleWorldBuilder} from "./Engine/World/SimpleWorldBuilder.ts";
import {EventHandler} from "./Utility/Excalibur/EventHandler.ts";
import {FrameRateManager} from "./Utility/FrameRateManager.ts";
import Stats from "./Utility/Stats/Stats.ts";
import {URLParams} from "./Utility/URLParams.ts";

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

const workerMode: boolean = URLParams.get('worker', "boolean") ?? false;
const autoStartMode: boolean = URLParams.get('autoStart', "boolean") ?? true;

const renderModes: RenderMode[] = [];

const modes = URLParams.get('renderMode', "string") ?? URLParams.get('mode', "string") ?? 'draw';

for (const mode of modes.split(',')) {
    switch (mode) {
        case 'debug':
        case 'image':
        case 'imageData':
            renderModes.push(RenderMode.ImageData);
            break;
        case 'draw':
            renderModes.push(RenderMode.Draw);
            break;
    }

    if (renderModes.length > 0) {
        break;
    }
}

const debugMode: boolean = URLParams.get('debug', "boolean") ?? false;
if (debugMode) {
    renderModes.push(RenderMode.Debug);
}


const config: Config = {
    world: {
        width: URLParams.get('width', "number") ?? 200,
        height: URLParams.get('height', "number") ?? 150,
    },
    chunks: {
        size: URLParams.get('chunkSize', "number") ?? 10,
    },
    simulation: {
        fps: URLParams.get('fps', "number") ?? 40,
        particleSize: URLParams.get('particleSize', "number") ?? 3,
    },
    worker: {
        canvasIdentifier: 'canvas#offscreen',
    },
    debug: {
        draw: false,
        stats: true,
        fillerOffset: 10,
        fillerLimit: -1,
    }
};

if (!config.worker) {
    throw new Error('no worker?');
}


const events = new EventHandler<WorkerMessage>();
let hasStarted: boolean = true;
document.body.addEventListener('keypress', ({code}) => {
    if (code !== 'Space') {
        return;
    }

    events.emit(hasStarted ? 'stop' : 'start', undefined);
    hasStarted = !hasStarted;
});

if (workerMode) {
    const workerManager = new WorkerManager(
        config,
        () => {
            console.log('Worker started!');

            for (const renderMode of renderModes) {
                const canvas = document.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
                if (!canvas) {
                    throw new Error(`No canvas found on selector: "canvas.${renderMode}"`);
                }

                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                workerManager.startRendering(renderMode, canvas);
            }
        }
    );

    events.pipe(workerManager);
} else {
    const world = new SimpleWorldBuilder().build(config);

    const simulator = new Simulator(world, ObviousNonsenseBehaviourManager);

    const renderers: Renderer[] = [];
    for (const renderMode of renderModes) {
        const canvas = document.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
        if (!canvas) {
            throw new Error(`No canvas found on selector: "canvas.${renderMode}"`);
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No ctx?');
        }

        renderers.push(RendererBuilder.build(renderMode, {
            ctx, world, config, dimensions: {width: window.innerWidth, height: window.innerHeight}
        }));
    }

    const stats: Stats | undefined = debugMode ? new Stats({
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

    if (debugMode && stats) {
        document.body.appendChild(stats.dom);
    }

    const centerX = Math.round(config.world.width / 2);
    const centerOffset: number = config.debug?.fillerOffset ?? 0;
    let fillerLimit: number = config.debug?.fillerLimit ?? -1;
    const fpsManager = new FrameRateManager(
        () => {
            simulator.update();

            if (fillerLimit !== 0) {
                for (let x = centerX - centerOffset; x < centerX + centerOffset; x++) {
                    if (fillerLimit !== 0 && x % 2 === 0) {
                        world.setParticle({x, y: 0} as WorldCoordinate, ParticleType.Sand);
                        fillerLimit--;
                    }
                }
            }
        },
        () => {
            stats?.begin();
            renderers.forEach(renderer => renderer.draw());
            stats?.end();
        },
        config.simulation.fps,
        !autoStartMode,
    );
    fpsManager.draw();

    events.on('start', () => fpsManager.start());
    events.on('stop', () => fpsManager.stop());
}