import {Constructor} from "../Utility/Type/Constructor.ts";
import {BehaviourManager} from "./Behaviour/BehaviourManager.ts";
import {Chunk} from "./Grid/Chunk.ts";
import {World} from "./Grid/World.ts";

export class Simulator {
    private readonly chunkManagers = new Map<Chunk, BehaviourManager>();

    constructor(
        private readonly world: World,
        private readonly builder: Constructor<BehaviourManager>
    ) {
    }

    public update(): void {
        this.world.iterateChunks(this.prepareForUpdate.bind(this));

        const duplicateCheck = new Set<number>();

        for (const [, manager] of this.chunkManagers) {
            manager.updateActiveChunk(duplicateCheck);
        }
    }

    private prepareForUpdate(chunk: Chunk): void {
        if (!this.chunkManagers.has(chunk)) {
            this.chunkManagers.set(chunk, new this.builder(this.world, chunk));
        }

        chunk.prepareForUpdate();
    }
}