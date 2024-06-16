import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {CanvasRenderer} from "../Renderer/CanvasRenderer.ts";
import {ImageDataRenderer} from "../Renderer/ImageDataRenderer.ts";
import {Renderer} from "../Renderer/Renderer.ts";
import {Simulator} from "../Simulator.ts";
import {Config} from "../Type/Config.ts";
import {WorkerMessage} from "../Type/WorkerMessage.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {MessageHandler} from "./Event/MessageHandler.ts";

let config: Config;
let ctx: OffscreenCanvasRenderingContext2D;
let simulator: Simulator;
let renderer: Renderer;

const handler = new MessageHandler<WorkerMessage>(undefined, false);
const fpsManager = new FrameRateManager(() => {
    simulator.update();
    renderer.draw();
}, 10, true);


handler.on('init', ({
                        canvas: offscreenCanvas,
                        config: browserConfig,
                    }
) => {
    config = browserConfig;
    fpsManager.setFPS(config.simulation.fps);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) {
        throw new Error('No ctx?');
    }

    ctx = offscreenCtx;

    const world = new SimpleWorldBuilder().build(config);

    simulator = new Simulator(world, ObviousNonsenseBehaviourManager);
    if (config.simulation.imageDataMode === true) {
        renderer = new ImageDataRenderer(ctx, world, config.simulation.particleSize, config.world.height, config.world.width);
    } else {
        renderer = new CanvasRenderer(ctx, world, config.simulation.particleSize, config.world.height, config.world.width);
    }

    const centerX = Math.round(config.world.width / 2);
    const centerOffset: number = config.debug?.fillerOffset ?? 0;
    let fillerLimit: number = config.debug?.fillerLimit ?? -1;
    simulator.on('preUpdate',() =>{
        if (fillerLimit !== 0) {
            world.iterateAllParticles((_particle, coordinate) => {
                if (fillerLimit === 0) {
                    return;
                }

                const {x, y} = coordinate;
                if (x > centerX - centerOffset && x < centerX + centerOffset && y === 0) {
                    world.setParticle(coordinate, ParticleType.Sand);
                    fillerLimit--;
                }
            });
        }
    });

    postMessage('Worker started!');

    fpsManager.start();
});