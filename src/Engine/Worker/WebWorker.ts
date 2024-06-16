import {FrameRateManager} from "../../Utility/FrameRateManager.ts";
import {ObviousNonsenseBehaviourManager} from "../Behaviour/ObviousNonsenseBehaviourManager.ts";
import {WorldCoordinate} from "../Grid/World.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {Renderer} from "../Renderer/Renderer.ts";
import {RendererBuilder} from "../Renderer/RendererBuilder.ts";
import {Simulator} from "../Simulator.ts";
import {Config} from "../Type/Config.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {WorkerMessage} from "../Type/WorkerMessage.ts";
import {SimpleWorldBuilder} from "../World/SimpleWorldBuilder.ts";
import {MessageHandler} from "./MessageHandler.ts";

type RendererMap = { [key in RenderMode]?: Renderer };

let config: Config;
let simulator: Simulator;
const renderers: RendererMap = {};

const handler = new MessageHandler<WorkerMessage>(undefined, false);
const fpsManager = new FrameRateManager(
    () => simulator.update(),
    () => Object.values(renderers).forEach(renderer => renderer.draw()),
    0, true);


handler.on('init', (browserConfig) => {
    config = browserConfig;

    const world = new SimpleWorldBuilder().build(config);

    simulator = new Simulator(world, ObviousNonsenseBehaviourManager);

    fpsManager.setFPS(config.simulation.fps);

    handler.on('start', () => fpsManager.start());
    handler.on('stop', () => fpsManager.stop());

    handler.on('startRendering', ({mode, canvas}) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to get context from canvas');
        }

        console.log('startRendering', mode);

        renderers[mode] = RendererBuilder.build(mode, {
            config, world, ctx,
            dimensions: config.world.outerBounds,
        });

        fpsManager.draw();
    });

    handler.on('stopRendering', ({mode}) => {
        console.log('stopRendering', mode);

        renderers[mode] = undefined;
    });

    handler.emit('ready', undefined);

    if (config.simulation.startOnInit !== false) {
        fpsManager.start();
    }

    const width = config.world.outerBounds?.width;
    if (width === undefined) {
        return;
    }

    const centerX = Math.round(width / 2);
    const centerOffset: number = config.debug?.fillerOffset ?? 0;
    let fillerLimit: number = config.debug?.fillerLimit ?? -1;
    simulator.on('preUpdate', () => {
        if (fillerLimit === 0) {
            return;
        }

        for (let x = centerX - centerOffset; x < centerX + centerOffset; x++) {
            if (fillerLimit !== 0 && x % 2 === 0) {
                world.setParticle({x, y: 0} as WorldCoordinate, ParticleType.Sand);
                fillerLimit--;
            }
        }
    });
});