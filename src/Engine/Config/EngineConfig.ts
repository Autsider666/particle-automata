import {Traversal, ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {URLParams} from "../../Utility/URLParams.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {RendererConfig} from "./RendererConfig.ts";
import {SimulationConfig} from "./SimulationConfig.ts";

export type EngineConfig = {
    useWorker: boolean,
    showStats: boolean,
    simulation: SimulationConfig,
    renderer: RendererConfig,
};

export class EngineConfigBuilder {
    static generate(): EngineConfig {
        const autoStartMode: boolean = URLParams.get('autoStart', "boolean") ?? true;

        const renderModes: RenderMode[] = [];

        const modes = URLParams.get('renderMode', "string") ?? URLParams.get('mode', "string") ?? 'draw';

        for (const mode of modes.split(',')) {
            switch (mode) {
                case 'debug':
                case 'draw':
                    renderModes.push(RenderMode.Draw);
                    break;
                case 'image':
                case 'imageData':
                    renderModes.push(RenderMode.ImageData);
                    break;
                case 'gl':
                case 'webgl':
                    renderModes.push(RenderMode.WebGL);
                    break;
            }

            if (renderModes.length > 0) {
                break;
            }
        }

        const debugMode: boolean = URLParams.get('debug', "boolean") ?? false;
        if (debugMode && !renderModes.includes(RenderMode.WebGL)) {
            renderModes.push(RenderMode.Debug);
        }

        const particleSize = URLParams.get('particleSize', "number") ?? 5;

        const outerBounds = Traversal.getGridDimensions(
            {
                width: URLParams.get('width', "number") ?? window.outerWidth,
                height: URLParams.get('height', "number") ?? window.innerHeight,
            },
            particleSize
        );

        return {
            useWorker: URLParams.get('worker', 'boolean') ?? true,
            showStats: URLParams.get('stats', "boolean") ?? false,
            simulation: {
                fps: URLParams.get('fps', "number") ?? 60,
                startOnInit: autoStartMode,
                outerBounds,
                chunks: {
                    size: URLParams.get('chunkSize', "number") ?? 10,
                },
            },
            renderer: {
                modes: renderModes,
                initialScreenBounds: {width: outerWidth, height: window.innerHeight} as ViewportDimensions,
                particleSize,
            },
        };
    }
}