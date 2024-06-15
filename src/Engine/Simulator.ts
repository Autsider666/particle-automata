import {Chunk} from "./Grid/Chunk.ts";
import {BehaviourManager} from "./Behaviour/BehaviourManager.ts";
import {World} from "./Grid/World.ts";
import {Constructor} from "../Utility/Type/Constructor.ts";

export class Simulator {
    private readonly chunkManagers = new Map<Chunk, BehaviourManager>();

    constructor(
        private readonly world: World,
        private readonly builder: Constructor<BehaviourManager>
    ) {
    }

    public update(): void {
        this.world.iterateChunks(this.updateManager.bind(this));

        for (const [, manager] of this.chunkManagers) {

            manager.updateActiveChunk();
        }

        // this.world.iterateChunks(chunk => chunk.commitChanges());
    }

    private updateManager(chunk: Chunk): void {
        if (!this.chunkManagers.has(chunk)) {
            this.chunkManagers.set(chunk, new this.builder(this.world, chunk));
        }
    }
}