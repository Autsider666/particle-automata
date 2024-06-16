import {EventEmitterInterface} from "../../Utility/Event/EventEmitterInterface.ts";
import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";
import {EventHandler, EventKey, EventMap, Handler} from "../../Utility/Excalibur/EventHandler.ts";
import {onWorker} from "../../Utility/OnWorker.ts";
import {MessageFormat, MessageIdentifier} from "../Type/WorkerMessage.ts";

export class MessageHandler<TMessages extends EventMap> implements EventHandlerInterface<TMessages> {
    private readonly events = new EventHandler<TMessages>();
    private readonly worker?: Worker;

    constructor(worker?: Worker, private readonly debug: boolean = false) {
        if (onWorker()) {
            self.onmessage = this.translateMessage.bind(this);
        } else if (worker) {
            this.worker = worker;

            this.worker.onmessage = (message: MessageEvent<MessageFormat<TMessages>>) => this.translateMessage(message);
        } else {
            throw new Error('Cannot initialize MessageHandler in browser without providing worker');
        }
    }

    handle<TMessageIdentifier extends EventKey<TMessages>>(
        type: TMessageIdentifier,
        data: TMessages[TMessageIdentifier]
    ): void {
        this.events.emit(type, data);
    }

    emit<TMessageIdentifier extends EventKey<TMessages>>(
        type: TMessageIdentifier,
        data: TMessages[TMessageIdentifier],
        transferables: Transferable[] = [],
    ): void {
        if (this.worker) {
            this.worker.postMessage({type, data}, transferables);
        } else {
            postMessage({type, data} satisfies MessageFormat<TMessages>);
        }
    }

    on<TEventName extends EventKey<TMessages>>(eventName: TEventName, handler: Handler<TMessages[TEventName]>): void {
        this.events.on(eventName, handler);
    }

    off<TEventName extends EventKey<TMessages>>(eventName: TEventName, handler: Handler<TMessages[TEventName]>): void {
        this.events.off(eventName, handler);
    }

    pipe(emitter: EventEmitterInterface<TMessages>): void {
        this.events.pipe(emitter);
    }

    private translateMessage(message: MessageEvent<MessageFormat<TMessages>>): void {
        if (typeof message !== 'object') {
            console.error('Invalid message received:', message);
            return;
        }

        const messageData = message.data;
        if (messageData === undefined) {
            console.error('Invalid message received', message);
            return;
        }

        const type = messageData.type satisfies MessageIdentifier<TMessages>;
        // noinspection SuspiciousTypeOfGuard
        if (typeof type !== 'string') {
            console.error('Message does not contain a type:', message); //TODO
            return;
        }

        if (this.debug) {
            console.debug(Math.round(performance.now()), type, messageData.data);
        }
        this.handle(type, messageData.data);
    }
}