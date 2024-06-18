import * as Comlink from "comlink";
import {EngineConfig} from "../EngineConfig.ts";
import {Particle} from "../Particle/Particle.ts";
import {ParticleType} from "../Particle/ParticleType.ts";

type ParticleData = {
    index: number,
    position: Int32Array,
    color: Int32Array,
    data: Particle,
}

const positionSize: number = 2;
const colorSize: number = 3;

export class WebWorkerSimulation {
    private callback?: (positions: Int32Array) => void;
    private readonly positions: Int32Array;
    private readonly colors: Int32Array;
    private readonly particles: Array<ParticleData>;

    constructor(config: EngineConfig) {
        const bounds = config.world.outerBounds;
        const length = bounds.height * bounds.width;
        this.positions = new Int32Array(length * positionSize);
        this.colors = new Int32Array(length * colorSize);

        this.particles = Array.from({length}, (_, index) => ({
            index,
            position: this.positions.subarray(index * positionSize, index * positionSize + positionSize),
            color: this.colors.subarray(index * colorSize, index * colorSize + colorSize),
            data: ParticleType.Air,
        }));

        console.log(this.particles);
    }

    async getData(): Promise<number> {
        return Math.random();
    }

    async update(): Promise<void> {
        console.log('Start on worker',performance.now());
        if (this.callback) {
            this.callback(this.positions);
        } else {
            console.error('no callback');
        }
        console.log('End on worker',performance.now());
    }

    async setCallback(callback: ((buffer: Int32Array) => void)) {
        this.callback = callback;
    }
}

Comlink.expose(WebWorkerSimulation);