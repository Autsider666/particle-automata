import {Traversal} from "../../Utility/Type/Dimensional.ts";
import {URLParams} from "../../Utility/URLParams.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {RendererConfig} from "./RendererConfig.ts";
import {SimulationConfig} from "./SimulationConfig.ts";

export type EngineConfig = {
    useWorker: boolean,
    simulation: SimulationConfig,
    renderer: RendererConfig,
};

export class EngineConfigBuilder {
    static generate(): EngineConfig {
        const autoStartMode: boolean = URLParams.get('autoStart', "boolean") ?? true;

        const renderModes: RenderMode[] = [];

        const modes = URLParams.get('renderMode', "string") ?? URLParams.get('mode', "string") ?? 'webgl';

        for (const mode of modes.split(',')) {
            switch (mode.toLowerCase()) {
                case 'debug':
                case 'draw':
                    renderModes.push(RenderMode.Draw);
                    break;
                case 'image':
                case 'imagedata':
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

        const width = (URLParams.get('width', "number") ?? window.outerWidth) * particleSize;
        const height = (URLParams.get('height', "number") ?? window.innerHeight) * particleSize;

        const viewport = Traversal.getViewportDimensions(
            {
                width: Math.min(width, window.outerWidth),
                height: Math.min(height, window.innerHeight),
            }
        );

        const outerBounds = Traversal.getGridDimensions(
            viewport,
            particleSize
        );

        const chunkSize = URLParams.get('chunkSize', "number") ?? 10;

        return {
            useWorker: URLParams.get('worker', 'boolean') ?? true,
            // ui: {
            //     ShowStats: {
            //         value: URLParams.get('stats', "boolean") ?? false,
            //     },
            //     SimulationRunning: {
            //         value: URLParams.get('autoStart', "boolean") ?? true,
            //     },
            //     DrawSize: {
            //         value: 1,
            //         valid: {
            //             min: 0,
            //             max: 10
            //         },
            //     },
            //     DrawElement: {
            //         value: ParticleElement.Sand,
            //     }
            //
            // },
            simulation: {
                fps: URLParams.get('fps', "number") ?? 60,
                startOnInit: autoStartMode,
                outerBounds,
                chunks: {
                    size: chunkSize,
                },
            },
            renderer: {
                modes: renderModes,
                viewport: viewport,
                particleSize,
            },
        };
    }
}