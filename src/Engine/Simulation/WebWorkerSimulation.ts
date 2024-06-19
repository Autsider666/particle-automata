import * as Comlink from "comlink";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {World} from "../Grid/World.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {Simulation} from "./Simulation.ts";
import {SimulationInterface} from "./SimulationInterface.ts";

export class WebWorkerSimulation {
    private updateCallback?: (buffer:ArrayBuffer) => void;
    private readonly fpsManager: FrameRateManager;
    private readonly simulation: SimulationInterface;
    private readonly world: World;
    // private readonly renderBuffer: SharedArrayBuffer;
    // private readonly renderParticles: DecodedBuffer<typeof RenderParticleSchema>[];

    constructor(
        private readonly config: SimulationConfig,
    ) {
        this.world = new SimpleWorldBuilder().build(this.config);
        console.log(this.world.setParticle({x:3,y:0} as WorldCoordinate, ParticleType.Sand));

        this.simulation = new Simulation(this.world, ObviousNonsenseBehaviourManager);
        this.fpsManager = new FrameRateManager(this.update.bind(this), config.fps, true);
        // const particleCount = config.outerBounds.width * config.outerBounds.height;
        // this.renderBuffer = new SharedArrayBuffer(structSize(RenderParticleSchema) * particleCount);
        // this.renderParticles = ArrayOfBufferBackedObjects(this.renderBuffer, RenderParticleSchema);
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

        // this.world.updateRenderParticles(this.renderParticles);

        this.updateCallback(this.world.getChangedParticleBuffer());
    }

    async setUpdateCallback(callback: ((buffer:ArrayBuffer) => void)): Promise<void> {
        this.updateCallback = callback;
    }

    // async getRenderBuffer():Promise<SharedArrayBuffer> {
    //     return this.renderBuffer;
    // }
}

Comlink.expose(WebWorkerSimulation);