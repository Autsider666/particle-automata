import * as Comlink from "comlink";
import {BaseEventHandler} from "../Utility/Excalibur/BaseEventHandler.ts";
import {FrameRateManager} from "../Utility/FrameRateManager.ts";
import Stats from "../Utility/Stats/Stats.ts";
import {ViewportDimensions} from "../Utility/Type/Dimensional.ts";
import {EngineConfig} from "./Config/EngineConfig.ts";
import {ParticleElement} from "./Particle/Particle.ts";
import {DynamicRenderer} from "./Renderer/DynamicRenderer.ts";
import {RendererInterface} from "./Renderer/RendererInterface.ts";
import {SimulationEvent} from "./Simulation/SimulationInterface.ts";
import {WebWorkerSimulation} from "./Simulation/WebWorkerSimulation.ts";
import Worker from "./Simulation/WebWorkerSimulation.ts?worker";
import {GridCoordinate, ViewportCoordinate} from "./Type/Coordinate.ts";
import {WorkerMessage} from "./Type/WorkerMessage.ts";

export type ModifyParticleEvent = {
    element: ParticleElement,
    coordinate: ViewportCoordinate,
    radius: number,
};

export type EngineEvent = {
    replaceParticles: ModifyParticleEvent,
    focus: boolean,
}

export class SimulationEngine extends BaseEventHandler<WorkerMessage & SimulationEvent & EngineEvent> {
    private isInitialized: boolean = false;

    private simulation!: WebWorkerSimulation;
    private fpsManager: FrameRateManager;
    private renderer: RendererInterface;
    private readonly stats?: Stats;

    constructor(
        private readonly rootElement: HTMLElement,
        private readonly config: EngineConfig,
    ) {
        super();

        this.renderer = new DynamicRenderer(config.renderer, rootElement);

        this.fpsManager = new FrameRateManager(
            this.draw.bind(this),
            60,
            !this.config.simulation.startOnInit,
        );

        this.events.on('replaceParticles', this.replaceParticles.bind(this));
        this.events.on('debug', this.handleDebug.bind(this));

        if (config.showStats) {
            this.stats = new Stats({
                width: 100,
                height: 60,
                showAll: true,
                defaultPanels: {
                    MS: {
                        decimals: 1,
                        maxValue: 25,
                    },
                }
            });

            document.body.appendChild(this.stats.dom); //TODO check if it can be added to rootElement
        }
    }

    resize(viewport: ViewportDimensions): void {
        this.renderer.resize(viewport);
    }

    start(): void {
        if (!this.isInitialized) {
            throw new Error('Can\'t start before initializing');
        }

        this.fpsManager.start();
    }

    stop(): void {
        this.fpsManager.stop();
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
        this.fpsManager.runCallback();

        this.isInitialized = true;
    }

    async isRunning(): Promise<boolean> {
        return this.fpsManager.isRunning();
    }

    private draw(): void {
        // this.stats?.begin();
        // this.renderer.render(this.world);
        // this.stats?.end();

        // this.world.dirtyChunks.length = 0;
        // this.world.dirtyParticles.length = 0;
    }

    private handleSimulationUpdate(): void {
        this.stats?.end();
        // const chunkSize = Math.pow(this.config.simulation.chunks.size, 2);
        // const schema = ChunkSchema(chunkSize);
        // for (const buffer of newBuffers) {
        //     const chunk = BufferBackedObject(buffer, schema);
        //     this.world.chunks[chunk.id] = chunk;
        //     dirtyChunks.push(chunk.id);
        // }
        //
        // for (const dirtyChunk of dirtyChunks) {
        //     if (!this.world.dirtyChunks.includes(dirtyChunk)) {
        //         this.world.dirtyChunks.push(dirtyChunk);
        //     }
        // }

        this.stats?.begin();
    }

    private handleDebug({x, y}: ViewportCoordinate): void {
        console.log(x,y);
        const coordinate = {
            x: Math.round(x / this.config.renderer.particleSize),
            y: Math.round(y / this.config.renderer.particleSize)
        } as GridCoordinate;
        this.simulation.whatParticleAmILookingAt(coordinate);
    }

    private replaceParticles({coordinate: {x, y}, element, radius}: ModifyParticleEvent): void {
        const coordinate = {
            x: Math.round(x / this.config.renderer.particleSize),
            y: Math.round(y / this.config.renderer.particleSize)
        } as GridCoordinate;

        const particleCoordinates: GridCoordinate[] = [];
        this.iterateAroundCoordinate(coordinate, coordinate => particleCoordinates.push(coordinate), radius);
        this.simulation.replaceParticles(element.type, particleCoordinates);
    }

    private iterateAroundCoordinate(
        {x, y}: GridCoordinate,
        callback: (coordinate: GridCoordinate) => void,
        radius: number,
        probability: number = 1,
    ) {
        const radiusSquared = radius * radius;
        for (let dX = -radius; dX <= radius; dX++) {
            const resultingX = x + dX;
            if (resultingX < 0 || resultingX >= this.config.simulation.outerBounds.width) {
                continue;
            }

            for (let dY = -radius; dY <= radius; dY++) {
                const resultingY = y + dY;
                if (resultingY < 0 || resultingY >= this.config.simulation.outerBounds.height) {
                    continue;
                }

                if (dX * dX + dY * dY <= radiusSquared && (probability >= 1 || Math.random() > 0.5)) {
                    callback({x: resultingX, y: resultingY} as GridCoordinate);
                }
            }
        }
    }
}