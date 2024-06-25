import * as Comlink from "comlink";
import {BaseEventHandler} from "../Utility/Excalibur/BaseEventHandler.ts";
import {ViewportDimensions} from "../Utility/Type/Dimensional.ts";
import {EngineConfig} from "./Config/EngineConfig.ts";
import {DynamicRenderer} from "./Renderer/DynamicRenderer.ts";
import {RendererInterface} from "./Renderer/RendererInterface.ts";
import {SimulationEvent} from "./Simulation/SimulationInterface.ts";
import {WebWorkerSimulation} from "./Simulation/WebWorkerSimulation.ts";
import Worker from "./Simulation/WebWorkerSimulation.ts?worker";
import {GridCoordinate, ViewportCoordinate} from "./Type/Coordinate.ts";
import {WorkerMessage} from "./Type/WorkerMessage.ts";
import {InputEvent} from "./UI/Event.ts";

export class Engine extends BaseEventHandler<WorkerMessage & SimulationEvent & InputEvent> {
    private isInitialized: boolean = false;

    private simulation!: WebWorkerSimulation;
    private renderer: RendererInterface;

    constructor(
        private readonly rootElement: HTMLElement,
        private readonly config: EngineConfig,
    ) {
        super();

        this.renderer = new DynamicRenderer(config.renderer, rootElement);

        // this.events.on('replaceParticles', this.replaceParticles.bind(this));
        this.events.on('debug', this.handleDebug.bind(this));
        this.events.on('SimulationRunning', async (isRunning) => isRunning ? await this.start() : await this.stop());
        this.events.on('debug', this.handleDebug.bind(this));
    }

    resize(viewport: ViewportDimensions): void {
        this.renderer.resize(viewport);
    }

    async start(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Can\'t start before initializing');
        }

        await this.simulation.start();
    }

    async stop(): Promise<void> {
        await this.simulation.stop();
    }

    async init(): Promise<void> {
        if (this.isInitialized) {
            throw new Error('Already initialized');
        }

        const canvas = document.createElement('canvas');

        canvas.width = this.config.renderer.viewport.width;
        canvas.height = this.config.renderer.viewport.height;
        this.rootElement.appendChild(canvas);
        const offscreen = canvas.transferControlToOffscreen();
        if (this.config.useWorker) {
            const Simulation = Comlink.wrap<WebWorkerSimulation>(new Worker());

            // @ts-expect-error Does not believe Simulation has a constructor.
            this.simulation = await new Simulation(
                this.config,
                Comlink.proxy(this.handleSimulationUpdate.bind(this)),
                Comlink.transfer(offscreen, [offscreen]),
            );
        } else {
            this.simulation = new WebWorkerSimulation(
                this.config,
                this.handleSimulationUpdate.bind(this),
                offscreen,
            );
        }

        await this.simulation.start();

        this.isInitialized = true;
    }

    private handleSimulationUpdate(): void {
        this.events.emit('postUpdate', undefined);
        this.events.emit('preUpdate', undefined);
    }

    private handleDebug({x, y}: ViewportCoordinate): void {
        console.log(x, y);
        const coordinate = {
            x: Math.round(x / this.config.renderer.particleSize),
            y: Math.round(y / this.config.renderer.particleSize)
        } as GridCoordinate;
        this.simulation.whatParticleAmILookingAt(coordinate);
    }

    // private replaceParticles({coordinate: {x, y}, element, radius}: ModifyParticleEvent): void {
    //     const coordinate = {
    //         x: Math.round(x / this.config.renderer.particleSize),
    //         y: Math.round(y / this.config.renderer.particleSize)
    //     } as GridCoordinate;
    //
    //     const particleCoordinates: GridCoordinate[] = [];
    //     this.iterateAroundCoordinate(coordinate, coordinate => particleCoordinates.push(coordinate), radius);
    //     this.simulation.replaceParticles(element.type, particleCoordinates);
    // }

    // private iterateAroundCoordinate(
    //     {x, y}: GridCoordinate,
    //     callback: (coordinate: GridCoordinate) => void,
    //     radius: number,
    //     probability: number = 1,
    // ) {
    //     const radiusSquared = radius * radius;
    //     for (let dX = -radius; dX <= radius; dX++) {
    //         const resultingX = x + dX;
    //         if (resultingX < 0 || resultingX >= this.config.simulation.outerBounds.width) {
    //             continue;
    //         }
    //
    //         for (let dY = -radius; dY <= radius; dY++) {
    //             const resultingY = y + dY;
    //             if (resultingY < 0 || resultingY >= this.config.simulation.outerBounds.height) {
    //                 continue;
    //             }
    //
    //             if (dX * dX + dY * dY <= radiusSquared && (probability >= 1 || Math.random() > 0.5)) {
    //                 callback({x: resultingX, y: resultingY} as GridCoordinate);
    //             }
    //         }
    //     }
    // }
}