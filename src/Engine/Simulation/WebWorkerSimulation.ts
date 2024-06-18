import * as Comlink from "comlink";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {World} from "../Grid/World.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {Simulation} from "./Simulation.ts";
import {SimulationInterface} from "./SimulationInterface.ts";

export class WebWorkerSimulation {
    private updateCallback?: () => void;
    private readonly fpsManager: FrameRateManager;
    private readonly simulation: SimulationInterface;
    private readonly world: World;

    constructor(private readonly config: SimulationConfig) {
        this.world = new SimpleWorldBuilder().build(this.config);
        this.simulation = new Simulation(this.world, ObviousNonsenseBehaviourManager);
        this.fpsManager = new FrameRateManager(this.update.bind(this), config.fps, true);
    }

    async start(): Promise<void> {
        this.fpsManager.start();
    }

    async stop(): Promise<void> {
        this.fpsManager.stop();
    }

    private update(): void {
        this.simulation.update();
        if (!this.updateCallback) {
            return;
        }

        this.updateCallback();
    }

    async setUpdateCallback(callback: (() => void)): Promise<void> {
        this.updateCallback = callback;
    }
}

Comlink.expose(WebWorkerSimulation);