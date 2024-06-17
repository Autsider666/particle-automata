import './style.css';
import '@snackbar/core/dist/snackbar.css';
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
import {Traversal} from "./Utility/Type/Dimensional.ts";
import {URLParams} from "./Utility/URLParams.ts";

const rootElement = document.querySelector<HTMLDivElement>('#renderer');
if (!rootElement) {
    throw new Error('Could not find root element');
}

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

const particleSize = URLParams.get('particleSize', "number") ?? 5;
const config: Config = {
    world: {
        outerBounds: Traversal.getGridDimensions(
            {
                width: URLParams.get('width', "number") ?? window.outerWidth,
                height: URLParams.get('height', "number") ?? window.innerHeight,
            },
            particleSize
        )
    },
    chunks: {
        size: URLParams.get('chunkSize', "number") ?? 10,
    },
    simulation: {
        fps: URLParams.get('fps', "number") ?? 60,
        particleSize,
        startOnInit: autoStartMode,
    },
    worker: {
        canvasIdentifier: 'canvas#offscreen',
    },
    debug: {
        draw: false,
        stats: true,
        fillerOffset: 5,
        fillerLimit: -1,
    }
};

if (!config.worker) {
    throw new Error('no worker?');
}


const events = new EventHandler<WorkerMessage>();
let hasStarted: boolean = autoStartMode;
document.body.addEventListener('keypress', ({code}) => {
    if (code !== 'Space') {
        return;
    }

    events.emit(hasStarted ? 'stop' : 'start', undefined);
    hasStarted = !hasStarted;
});

window.addEventListener('resize', () => events.emit('resize', Traversal.getGridDimensions(
    {
        width: URLParams.get('width', "number") ?? window.innerWidth,
        height: URLParams.get('height', "number") ?? window.innerHeight,
    },
    config.simulation.particleSize,
)));

if (workerMode) {
    const workerManager = new WorkerManager(
        config,
        () => {
            console.log('Worker started!');

            for (const renderMode of renderModes) {
                let canvas = rootElement.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
                if (!canvas) {

                    canvas = document.createElement('canvas');
                    canvas.classList.add(renderMode);
                    rootElement.appendChild(canvas);
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
        let canvas = rootElement.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.classList.add(renderMode);
            rootElement.appendChild(canvas);
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No ctx?');
        }

        renderers.push(RendererBuilder.build(renderMode, {
            ctx, world, config, dimensions: Traversal.getGridDimensions(
                {
                    width: URLParams.get('width', "number") ?? window.innerWidth,
                    height: URLParams.get('height', "number") ?? window.innerHeight,
                },
                particleSize
            )
        }));
    }

    const statsMode: boolean = URLParams.get('stats', "boolean") ?? false;
    const stats: Stats | undefined = statsMode ? new Stats({
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

    if (statsMode && stats) {
        document.body.appendChild(stats.dom);
    }

    const centerX = Math.round((config.world.outerBounds?.width ?? window.innerWidth) / 2);
    const centerOffset: number = config.debug?.fillerOffset ?? 0;
    let fillerLimit: number = config.debug?.fillerLimit ?? -1;
    const fpsManager = new FrameRateManager(
        () => {
            simulator.update();

            if (fillerLimit !== 0) {
                for (let x = centerX - centerOffset; x < centerX + centerOffset; x++) {
                    if (fillerLimit !== 0 && x % 2 === 0) {
                        world.setParticle({x, y: 0} as WorldCoordinate, ParticleType.Water);
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
    events.on('resize', dimensions => renderers.forEach(renderer => renderer.resize(dimensions)));
}