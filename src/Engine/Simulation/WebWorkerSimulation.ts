import * as Comlink from "comlink";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {EngineConfig} from "../Config/EngineConfig.ts";
import {World} from "../Grid/World.ts";
import {ParticleIdentifier, ParticleType} from "../Particle/ParticleType.ts";
import {RealWorldWebGLRenderer} from "../Renderer/RealWorldWebGLRenderer.ts";
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

export type UpdateCallback = () => void

export class WebWorkerSimulation {
    private readonly fpsManager: FrameRateManager;
    private readonly simulation: SimulationInterface;
    private readonly world: World;
    private readonly events = new EventHandler<WorldEvent>();
    private readonly renderer: RealWorldWebGLRenderer;
    // private readonly unsendChunkBuffers: SharedArrayBuffer[] = [];
    // private readonly renderBuffer: SharedArrayBuffer;
    // private readonly renderParticles: DecodedBuffer<typeof RenderParticleSchema>[];

    constructor(
        private readonly config: EngineConfig,
        private readonly updateCallback: UpdateCallback,
        canvas: OffscreenCanvas,
    ) {
        // this.events.on('chunkCreated', ({chunk}) => this.unsendChunkBuffers.push(chunk.buffer));

        this.world = new SimpleWorldBuilder().build(this.config.simulation, this.events);

        this.simulation = new Simulation(this.world, ObviousNonsenseBehaviourManager);
        this.fpsManager = new FrameRateManager(this.update.bind(this), this.config.simulation.fps, true);
        // const particleCount = config.outerBounds.width * config.outerBounds.height;
        // this.renderBuffer = new SharedArrayBuffer(structSize(RenderParticleSchema) * particleCount);
        // this.renderParticles = ArrayOfBufferBackedObjects(this.renderBuffer, RenderParticleSchema);

        this.renderer = new RealWorldWebGLRenderer({
            config: config.renderer,
            canvas
        });
    }

    async start(): Promise<void> {
        this.fpsManager.start();
    }

    async stop(): Promise<void> {
        this.fpsManager.stop();
    }

    private update(): void {
        this.simulation.update();
        const middle = Math.round(this.config.simulation.outerBounds.width/3);
        const range = 50;
        for (let i = -range; i < range; i++) {
            if (i %2 === 0) {
                continue;
            }
            this.world.setParticle({x: middle+i, y: 0} as GridCoordinate, ParticleType.Sand);
        }
        // this.world.setParticle({x: 2, y: 0} as GridCoordinate, ParticleType.Sand);
        // this.world.setParticle({x: 4, y: 0} as GridCoordinate, ParticleType.Sand);
        // this.world.setParticle({x: 6, y: 0} as GridCoordinate, ParticleType.Sand);
        // this.world.setParticle({x: 8, y: 0} as GridCoordinate, ParticleType.Sand);
        // this.world.setParticle({x: 10, y: 0} as GridCoordinate, ParticleType.Sand);
        // this.world.setParticle({x: 12, y: 0} as GridCoordinate, ParticleType.Sand);

        this.updateCallback();

        // if (this.unsendChunkBuffers.length === 0) {
        //     return;
        // }

        // this.updateCallback({
        //     newBuffers: this.unsendChunkBuffers,
        //     dirtyChunks: this.world.getActiveChunkIds(),
        //     dirtyParticles: [],
        // });
        //
        // this.unsendChunkBuffers.length = 0;

        this.renderer.render({
            dirtyParticles: [],
            particles: [],
            dirtyChunks: [],
            chunks: [],
        }, this.world);
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
            if (this.world.isValidCoordinate(particleCoordinate)) {
                this.world.setParticle(particleCoordinate, ParticleType.get(type));
            }
            // if (replace || this.world.getParticle(particleCoordinate)?.type !== type) {
            // }
        }
    }
}

Comlink.expose(WebWorkerSimulation);