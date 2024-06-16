export type Config = {
    world: {
        width: number,
        height: number,
    },
    chunks: {
        size: number,
    }
    simulation: {
        fps: number,
        particleSize: number,
        imageDataMode?: boolean,
    },
    worker?:{
      canvasIdentifier: string,
    },
    debug?: {
        draw?: boolean,
        stats?: boolean,
        fillerOffset?: number,
        fillerLimit?: number,
    },
};