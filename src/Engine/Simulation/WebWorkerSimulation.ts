import * as Comlink from "comlink";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {SimulationConfig} from "../Config/SimulationConfig.ts";
import {World} from "../Grid/World.ts";
import {ParticleIdentifier, ParticleType} from "../Particle/ParticleType.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {WorldEvent} from "../World/WorldBuilder.ts";
import {Simulation} from "./Simulation.ts";
import {SimulationInterface} from "./SimulationInterface.ts";

export type UpdateData = {
    newBuffers: SharedArrayBuffer[],
    dirtyChunks: number[],
    dirtyParticles: number[],
}

export type UpdateCallback = (data: UpdateData) => void

export class WebWorkerSimulation {
    private readonly fpsManager: FrameRateManager;
    private readonly simulation: SimulationInterface;
    private readonly world: World;
    private readonly events = new EventHandler<WorldEvent>();
    private readonly unsendChunkBuffers: SharedArrayBuffer[] = [];
    // private readonly renderBuffer: SharedArrayBuffer;
    // private readonly renderParticles: DecodedBuffer<typeof RenderParticleSchema>[];

    constructor(
        private readonly config: SimulationConfig,
        private readonly updateCallback: UpdateCallback
    ) {
        this.events.on('chunkCreated', ({chunk}) => this.unsendChunkBuffers.push(chunk.buffer));

        this.world = new SimpleWorldBuilder().build(this.config, this.events);
        this.world.setParticle({x: 2, y: 0} as GridCoordinate, ParticleType.Sand);

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

        // if (this.unsendChunkBuffers.length === 0) {
        //     return;
        // }

        this.updateCallback({
            newBuffers: this.unsendChunkBuffers,
            dirtyChunks: this.world.getActiveChunkIds(),
            dirtyParticles: [],
        });

        this.unsendChunkBuffers.length = 0;
    }

    // async setUpdateCallback(callback: ((buffer: ArrayBuffer) => void)): Promise<void> {
    //     this.updateCallback = callback;
    // }
    //
    // async setNewChunkCallback(callback: SharedArrayBufferCallback): Promise<void> {
    //     this.newChunkCallback = callback;
    // }

    // async getRenderBuffer():Promise<SharedArrayBuffer> {
    //     return this.renderBuffer;
    // }
    replaceParticles(type: ParticleIdentifier, particleCoordinates: GridCoordinate[]) {
        for (const particleCoordinate of particleCoordinates) {
            if (this.world.getParticle(particleCoordinate)?.type !== type) {
                this.world.setParticle(particleCoordinate, ParticleType.get(type));
            }
        }
    }
}

Comlink.expose(WebWorkerSimulation);