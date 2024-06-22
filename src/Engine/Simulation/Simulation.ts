import {EventKey, Handler} from "../../Utility/Event/Type.ts";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {Constructor} from "../../Utility/Type/Constructor.ts";
import {BehaviourManager} from "../Behaviour/BehaviourManager.ts";
import {Chunk} from "../Grid/Chunk.ts";
import {World} from "../Grid/World.ts";
import {SimulationEvent, SimulationInterface} from "./SimulationInterface.ts";


export class Simulation implements SimulationInterface {
    private readonly chunkManagers = new Map<Chunk, BehaviourManager>();
    private readonly events = new EventHandler<SimulationEvent>();

    constructor(
        private readonly world: World,
        private readonly managerConstructor: Constructor<BehaviourManager>
    ) {
    }

    public update(): void {
        this.world.prepareForUpdate();
        this.world.iterateActiveChunks(this.prepareForUpdate.bind(this));

        this.events.emit('preUpdate', undefined);

        const duplicateCheck = new Set<number>();

        for (const [, manager] of this.chunkManagers) {
            manager.updateActiveChunk(duplicateCheck);
        }
    }

    on<TEventName extends EventKey<SimulationEvent>>(eventName: TEventName, handler: Handler<SimulationEvent[TEventName]>): void {
        this.events.on(eventName, handler);
    }

    off<TEventName extends EventKey<SimulationEvent>>(eventName: TEventName, handler: Handler<SimulationEvent[TEventName]>): void {
        this.events.off(eventName, handler);
    }

    private prepareForUpdate(chunk: Chunk): void {
        if (!this.chunkManagers.has(chunk)) {
            this.chunkManagers.set(chunk, new this.managerConstructor(this.world, chunk));
        }

        chunk.prepareForUpdate();
    }
}