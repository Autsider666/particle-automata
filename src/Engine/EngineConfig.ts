import {Traversal, WorldDimensions} from "../Utility/Type/Dimensional.ts";
import {URLParams} from "../Utility/URLParams.ts";
import {RenderMode} from "./Type/RenderMode.ts";

export type EngineConfig = {
    world: {
        outerBounds: WorldDimensions
    },
    chunks: {
        size: number,
    }
    simulation: {
        fps: number,
        particleSize: number,
        imageDataMode?: boolean,
        startOnInit?: boolean,
    },
    renderer: {
        modes: RenderMode[],
    }
    worker?: {
        canvasIdentifier: string,
    },
    debug?: {
        draw?: boolean,
        stats?: boolean,
        fillerOffset?: number,
        fillerLimit?: number,
    },
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
        return {
            world: {
                outerBounds: Traversal.getGridDimensions(
                    {
                        width: URLParams.get('width', "number") ?? window.outerWidth,
                        height: URLParams.get('height', "number") ?? window.innerHeight,
                    },
                    particleSize
                )
            },
            chunks: {
                size: URLParams.get('chunkSize', "number") ?? 10,
            },
            simulation: {
                fps: URLParams.get('fps', "number") ?? 60,
                particleSize,
                startOnInit: autoStartMode,
            },
            renderer: {
                modes: renderModes,
            },
            worker: {
                canvasIdentifier: 'canvas#offscreen',
            },
            debug: {
                draw: false,
                stats: true,
                fillerOffset: 5,
                fillerLimit: -1,
            }
        };
    }
}