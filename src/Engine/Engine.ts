import * as Comlink from "comlink";
import {BaseEventHandler} from "../Utility/Excalibur/BaseEventHandler.ts";
import {FrameRateManager} from "../Utility/FrameRateManager.ts";
import Stats from "../Utility/Stats/Stats.ts";
import {EngineConfig} from "./Config/EngineConfig.ts";
import {World} from "./Grid/World.ts";
import {Renderer} from "./Renderer/Renderer.ts";
import {RendererBuilder} from "./Renderer/RendererBuilder.ts";
import {WebWorkerSimulation} from "./Simulation/WebWorkerSimulation.ts";
import Worker from "./Simulation/WebWorkerSimulation.ts?worker";
import {WorkerMessage} from "./Type/WorkerMessage.ts";
import {SimpleWorldBuilder} from "./World/SimpleWorldBuilder.ts";

export class Engine extends BaseEventHandler<WorkerMessage>{
    private isInitialized: boolean = false;

    private simulation: WebWorkerSimulation;
    private readonly world: World;
    private fpsManager: FrameRateManager;
    private readonly renderers: Renderer[] = [];
    private readonly stats?: Stats;

    constructor(
        private readonly rootElement: HTMLElement,
        private readonly config: EngineConfig,
    ) {
        super();

        if (this.config.useWorker) {
            const Simulation = Comlink.wrap<WebWorkerSimulation>(new Worker());

            // @ts-expect-error Does not believe Simulation has a constructor.
            this.simulation = new Simulation(this.config.simulation);
        } else {
            this.simulation = new WebWorkerSimulation(this.config.simulation);
        }

        this.world = new SimpleWorldBuilder().build(config.simulation);

        for (const renderMode of this.config.renderer.modes) {
            this.renderers.push(RendererBuilder.build(renderMode, this.config.renderer, this.rootElement));
        }

        this.fpsManager = new FrameRateManager(
            this.draw.bind(this),
            this.config.simulation.fps,
            !this.config.simulation.startOnInit,
        );

        this.events.on('start', () => this.fpsManager.start());
        this.events.on('stop', () => this.fpsManager.stop());

        //TODO add world mass dirty here as well so all the clear logic can be removed out of renderer?
        this.events.on('resize', dimensions => this.renderers.forEach(renderer => renderer.resize(dimensions)));

        if (config.showStats) {
            this.stats = new Stats({
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
            });

            document.body.appendChild(this.stats.dom); //TODO check if it can be added to rootElement
        }
    }

    async start(): Promise<void> {
        if (!this.isInitialized) {
            await this.init();
        }

        this.fpsManager.start();
    }

    async stop(): Promise<void> {
        this.fpsManager.stop();
    }

    private async init(): Promise<void> {
        if (this.isInitialized) {
            throw new Error('Already initialized');
        }

        if (this.config.useWorker) {
            await (await this.simulation).setCallback(Comlink.proxy(this.handleSimulationOutput));
        } else {
            await this.simulation.setCallback(this.handleSimulationOutput);
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

    private handleSimulationOutput(): void {
        // console.log('output');
    }
}