import * as Comlink from "comlink";
import {BufferBackedObject} from "../Utility/BufferBackedObject.ts";
import {BaseEventHandler} from "../Utility/Excalibur/BaseEventHandler.ts";
import {FrameRateManager} from "../Utility/FrameRateManager.ts";
import Stats from "../Utility/Stats/Stats.ts";
import {ViewportDimensions} from "../Utility/Type/Dimensional.ts";
import {EngineConfig} from "./Config/EngineConfig.ts";
import {DynamicRenderer} from "./Renderer/DynamicRenderer.ts";
import {RendererInterface} from "./Renderer/RendererInterface.ts";
import {RendererWorld} from "./Renderer/Type/RendererWorld.ts";
import {ChunkSchema} from "./Schema/ChunkSchema.ts";
import {UpdateData, WebWorkerSimulation} from "./Simulation/WebWorkerSimulation.ts";
import Worker from "./Simulation/WebWorkerSimulation.ts?worker";
import {WorkerMessage} from "./Type/WorkerMessage.ts";

export class Engine extends BaseEventHandler<WorkerMessage> {
    private isInitialized: boolean = false;

    private simulation!: WebWorkerSimulation;
    private fpsManager: FrameRateManager;
    private renderer: RendererInterface;
    private readonly stats?: Stats;
    private readonly world: RendererWorld;

    constructor(
        rootElement: HTMLElement,
        private readonly config: EngineConfig,
    ) {
        super();

        console.log(this.config);

        this.world = {
            chunks: [],
            dirtyChunks: [],
            dirtyParticles: [],
            particles: [],
        };

        this.renderer = new DynamicRenderer(config.renderer, rootElement);

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

        if (this.config.useWorker) {
            const Simulation = Comlink.wrap<WebWorkerSimulation>(new Worker());

            // @ts-expect-error Does not believe Simulation has a constructor.
            this.simulation = await new Simulation(
                this.config.simulation,
                Comlink.proxy(this.handleSimulationUpdate.bind(this)),
            );
        } else {
            this.simulation = new WebWorkerSimulation(
                this.config.simulation,
                this.handleSimulationUpdate.bind(this),
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
        this.stats?.begin();
        this.renderer.render(this.world);
        this.stats?.end();

        this.world.dirtyChunks.length = 0;
        this.world.dirtyParticles.length = 0;
    }

    private handleSimulationUpdate({newBuffers, dirtyChunks}: UpdateData): void {
        const chunkSize = Math.pow(this.config.simulation.chunks.size, 2);
        const schema = ChunkSchema(chunkSize);
        for (const buffer of newBuffers) {
            const chunk = BufferBackedObject(buffer, schema);
            this.world.chunks[chunk.id] = chunk;
            dirtyChunks.push(chunk.id);
        }

        for (const dirtyChunk of dirtyChunks) {
            if (!this.world.dirtyChunks.includes(dirtyChunk)) {
                this.world.dirtyChunks.push(dirtyChunk);
            }
        }
    }
}