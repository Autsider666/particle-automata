import * as Comlink from "comlink";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {Particle} from "../Particle/Particle.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {Simulator} from "./Simulator.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";

type ParticleData = {
    index: number,
    position: Int32Array,
    color: Int32Array,
    data: Particle,
}

type SimulatorEvent = {
    preUpdate: unknown,
    postUpdate: unknown,
}

const positionSize: number = 2;
const colorSize: number = 3;

export class WebWorkerSimulation {
    private callback?: (positions: Int32Array) => void;
    private readonly positions: Int32Array;
    private readonly colors: Int32Array;
    private readonly particles: Array<ParticleData>;
    private readonly fpsManager: FrameRateManager;

    private readonly events = new EventHandler<SimulatorEvent>();

    constructor(private readonly config: SimulationConfig) {
        this.fpsManager = new FrameRateManager(this.update.bind(this), config.fps, true);

        const bounds = config.outerBounds;
        const length = bounds.height * bounds.width;
        this.positions = new Int32Array(length * positionSize);
        this.colors = new Int32Array(length * colorSize);

        this.particles = Array.from({length}, (_, index) => ({
            index,
            position: this.positions.subarray(index * positionSize, index * positionSize + positionSize),
            color: this.colors.subarray(index * colorSize, index * colorSize + colorSize),
            data: ParticleType.Air,
        }));

        this.events.on('postUpdate', () => console.log('postUpdate'));
    }

    async init(): Promise<void> {
        const world = new SimpleWorldBuilder().build(this.config);

        new Simulator(world, ObviousNonsenseBehaviourManager);
    }

    async start():Promise<void> {
        this.fpsManager.start();
    }

    async stop(): Promise<void> {
        this.fpsManager.stop();
    }

    private update(): void {
        if (this.callback && this.particles.length) {
            this.callback(this.positions);
        }
    }

    async setCallback(callback: ((buffer: Int32Array) => void)): Promise<void> {
        this.callback = callback;
    }
}

Comlink.expose(WebWorkerSimulation);