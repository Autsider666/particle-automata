export type Config = {
    world: {
        outerBounds?: {
            width: number,
            height: number,
        }
    },
    chunks: {
        size: number,
    }
    simulation: {
        fps: number,
        particleSize: number,
        imageDataMode?: boolean,
        startOnInit?:boolean,
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