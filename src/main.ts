import './style.css';
import '@snackbar/core/dist/snackbar.css';
import * as Comlink from "comlink";
import {ObviousNonsenseBehaviourManager} from "./Engine/Behaviour/ObviousNonsenseBehaviourManager.ts";
import {WorkerManager} from "./Engine/Browser/WorkerManager.ts";
import {EngineConfigBuilder} from "./Engine/EngineConfig.ts";
import {ParticleType} from "./Engine/Particle/ParticleType.ts";
import {Renderer} from "./Engine/Renderer/Renderer.ts";
import {RendererBuilder} from "./Engine/Renderer/RendererBuilder.ts";
import {Simulator} from "./Engine/Simulator.ts";
import {WorldCoordinate} from "./Engine/Type/Coordinate.ts";
import {RenderMode} from "./Engine/Type/RenderMode.ts";
import {WorkerMessage} from "./Engine/Type/WorkerMessage.ts";
import type {WebWorkerSimulation} from './Engine/Simulator/WebWorkerSimulation.ts';
import Worker from './Engine/Simulator/WebWorkerSimulation.ts?worker';
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
const config = EngineConfigBuilder.generate();

const Simulation = Comlink.wrap<WebWorkerSimulation>(new Worker());

init().then(() => console.log('init finished'));

const callback = (positions: Int32Array): void => {
    console.log('callback!', positions, performance.now());
};

async function init(): Promise<void> {
    // @ts-expect-error It has, but it just doesn't show here
    const simulation = await new Simulation(config) as unknown as SimulationWorker;

    await simulation.setCallback(Comlink.proxy(callback));

    console.log('Start on main', performance.now());
    await simulation.update();
    console.log('1st done on main', performance.now());
    await simulation.update();
    console.log('2nd done on main', performance.now());
    await simulation.update();
    console.log('3th done on main', performance.now());
}


const events = new EventHandler<WorkerMessage>();
let hasStarted: boolean = config.simulation.startOnInit ?? true;
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

const getCanvasForMode = (renderMode: RenderMode): HTMLCanvasElement => {
    let canvas = rootElement.querySelector<HTMLCanvasElement>(`canvas.${renderMode}`);
    if (!canvas) {

        canvas = document.createElement('canvas');
        canvas.classList.add(renderMode);
        rootElement.appendChild(canvas);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
};

if (workerMode) {
    const workerManager = new WorkerManager(
        config,
        () => {
            console.log('Worker started!');

            for (const renderMode of config.renderer.modes) {
                workerManager.startRendering(renderMode, getCanvasForMode(renderMode));
            }
        }
    );

    events.pipe(workerManager);
} else {
    const world = new SimpleWorldBuilder().build(config);

    const simulator = new Simulator(world, ObviousNonsenseBehaviourManager);

    const renderers: Renderer[] = [];
    for (const renderMode of config.renderer.modes) {
        renderers.push(RendererBuilder.build(renderMode, {
            world, config, canvas: getCanvasForMode(renderMode),
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
        !hasStarted,
    );
    fpsManager.draw();

    events.on('start', () => fpsManager.start());
    events.on('stop', () => fpsManager.stop());

    //TODO add world mass dirty here as well so all the clear logic can be removed out of renderer?
    events.on('resize', dimensions => renderers.forEach(renderer => renderer.resize(dimensions)));
}