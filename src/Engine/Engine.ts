import * as Comlink from "comlink";
import {BaseEventHandler} from "../Utility/Excalibur/BaseEventHandler.ts";
import {FrameRateManager} from "../Utility/FrameRateManager.ts";
import Stats from "../Utility/Stats/Stats.ts";
import {WorldDimensions} from "../Utility/Type/Dimensional.ts";
import {EngineConfig} from "./Config/EngineConfig.ts";
import {Renderer} from "./Renderer/Renderer.ts";
import {RendererBuilder} from "./Renderer/RendererBuilder.ts";
import {RendererChunk} from "./Renderer/Type/RendererChunk.ts";
import {RendererParticle} from "./Renderer/Type/RendererParticle.ts";
import {RendererWorld} from "./Renderer/Type/RendererWorld.ts";
import {WebWorkerSimulation} from "./Simulation/WebWorkerSimulation.ts";
import Worker from "./Simulation/WebWorkerSimulation.ts?worker";
import {ChunkCoordinate, WorldCoordinate} from "./Type/Coordinate.ts";
import {WorkerMessage} from "./Type/WorkerMessage.ts";

export class Engine extends BaseEventHandler<WorkerMessage> {
    private isInitialized: boolean = false;

    private simulation!: WebWorkerSimulation;
    private fpsManager: FrameRateManager;
    private readonly renderers: Renderer[] = [];
    private readonly stats?: Stats;
    private readonly world: RendererWorld;

    constructor(
        private readonly rootElement: HTMLElement,
        private readonly config: EngineConfig,
    ) {
        super();

        this.world = {
            chunks: new Map<ChunkCoordinate, RendererChunk>(),
            dirtyChunks: new Map<ChunkCoordinate, RendererChunk>(),
            dirtyParticles: new Map<WorldCoordinate, RendererParticle>(),
            particles: new Map<WorldCoordinate, RendererParticle>()
        };

        for (const renderMode of this.config.renderer.modes) {
            this.renderers.push(RendererBuilder.build(renderMode, this.config.renderer, this.rootElement));
        }

        this.fpsManager = new FrameRateManager(
            this.draw.bind(this),
            60,
            !this.config.simulation.startOnInit,
        );

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

    resize(dimensions: WorldDimensions): void {
        for (const renderer of this.renderers) {
            renderer.resize(dimensions);
        }
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

        if (this.config.useWorker) {
            const Simulation = Comlink.wrap<WebWorkerSimulation>(new Worker());

            // @ts-expect-error Does not believe Simulation has a constructor.
            this.simulation = await new Simulation(this.config.simulation);
            await this.simulation.setUpdateCallback(Comlink.proxy(this.handleSimulationUpdate.bind(this)));
        } else {
            this.simulation = new WebWorkerSimulation(this.config.simulation);
            await this.simulation.setUpdateCallback(this.handleSimulationUpdate.bind(this));
        }

        await this.simulation.start();
        this.fpsManager.runCallback();

        this.isInitialized = true;
    }

    async isRunning(): Promise<boolean> {
        return this.fpsManager.isRunning();
    }

    private draw(): void {
        this.stats?.begin();
        for (const renderer of this.renderers) {
            renderer.draw(this.world);
        }
        this.stats?.end();
    }

    private handleSimulationUpdate(): void {
        this.world.dirtyParticles.clear();
        this.world.dirtyChunks.clear();
    }
}