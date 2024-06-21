import * as Comlink from "comlink";
import {Array2D} from "../../Utility/Array2D.ts";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {EngineConfig} from "../Config/EngineConfig.ts";
import {World} from "../Grid/World.ts";
import {ElementType} from "../Particle/Particle.ts";
import {RealWorldWebGLRenderer} from "../Renderer/RealWorldWebGLRenderer.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {WorldEvent} from "../World/WorldBuilder.ts";
import {Simulation} from "./Simulation.ts";
import {SimulationInterface} from "./SimulationInterface.ts";

export type UpdateCallback = () => void

export class WebWorkerSimulation {
    private readonly fpsManager: FrameRateManager;
    private readonly simulation: SimulationInterface;
    private readonly world: World;
    private readonly events = new EventHandler<WorldEvent>();
    private readonly renderer: RealWorldWebGLRenderer;
    private readonly createQueue: Array2D<ElementType | undefined, GridCoordinate>;

    constructor(
        private readonly config: EngineConfig,
        private readonly updateCallback: UpdateCallback,
        canvas: OffscreenCanvas,
    ) {
        this.world = new SimpleWorldBuilder().build(this.config.simulation, this.events);

        this.simulation = new Simulation(this.world, ObviousNonsenseBehaviourManager);
        this.fpsManager = new FrameRateManager(this.update.bind(this), this.config.simulation.fps, true);

        this.renderer = new RealWorldWebGLRenderer({
            config: config.renderer,
            canvas
        });

        this.renderer.render({
            dirtyParticles: [],
            particles: [],
            dirtyChunks: [],
            chunks: [],
        }, this.world);

        this.createQueue = new Array2D<ElementType | undefined, GridCoordinate>(config.simulation.outerBounds, () => undefined);
    }

    async start(): Promise<void> {
        this.fpsManager.start();
    }

    async stop(): Promise<void> {
        this.fpsManager.stop();
    }

    private update(): void {
        this.simulation.update();

        this.createQueue.iterateChanges(({item: type, coordinate}) => {
            if (type) {
                this.world.createNewParticle(coordinate, type);
            }
        });
        this.createQueue.resetChanges();

        this.render();

        this.updateCallback();
    }

    private render(): void {
        this.world.prepareForDraw();

        this.renderer.render({
            dirtyParticles: [],
            particles: [],
            dirtyChunks: [],
            chunks: [],
        }, this.world);
    }

    replaceParticles(type: ElementType, particleCoordinates: GridCoordinate[]) {
        for (const particleCoordinate of particleCoordinates) {
            if (this.world.isValidCoordinate(particleCoordinate)) {
                this.createQueue.set(particleCoordinate, type);
            }
        }
    }

    whatParticleAmILookingAt(coordinate: GridCoordinate): void {
        const particle = this.world.getParticle(coordinate);
        console.log(coordinate, particle?.element.type, particle);
    }
}

Comlink.expose(WebWorkerSimulation);