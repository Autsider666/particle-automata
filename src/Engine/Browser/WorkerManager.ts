import {EventEmitterInterface} from "../../Utility/Event/EventEmitterInterface.ts";
import {EventKey} from "../../Utility/Excalibur/EventHandler.ts";
import {Config} from "../Type/Config.ts";
import {RenderMode} from "../Type/RenderMode.ts";
import {WorkerMessage} from "../Type/WorkerMessage.ts";
import {MessageHandler} from "../Worker/MessageHandler.ts";
import WebWorker from './../Worker/WebWorker.ts?worker';

export class WorkerManager<Events extends WorkerMessage = WorkerMessage> implements EventEmitterInterface<Events> {
    private readonly worker: Worker;
    private readonly handler: MessageHandler<Events>;
    private workerOnline: boolean = false;

    constructor(
        config: Config,
        readyCallback?: () => void,
    ) {
        this.worker = new WebWorker();
        this.handler = new MessageHandler<Events>(this.worker);

        this.handler.on('ready', () => {
            this.workerOnline = true;
            if (readyCallback) {
                readyCallback();
            }
        });

        this.handler.emit('init', config);
    }

    public pipeWorkerEvents(handler: EventEmitterInterface<Events>): void {
        this.handler.pipe(handler);
    }

    public pipeEventsToWorker(handler: EventEmitterInterface<Events>): void {
        handler.pipe(this.handler);
    }

    public startRendering(mode: RenderMode, canvas: HTMLCanvasElement): void {
        if (!this.workerOnline) {
            throw new Error('Unable to start rendering this when worker is not online.');
        }

        const offscreenCanvas = canvas.transferControlToOffscreen();

        this.handler.emit('startRendering', {
            mode,
            canvas: offscreenCanvas,
        }, [offscreenCanvas]);
    }

    public stopRendering(mode: RenderMode): void {
        if (!this.workerOnline) {
            throw new Error('Unable to start rendering this when worker is not online.');
        }

        this.handler.emit('stopRendering', {mode});
    }

    emit<TEventName extends EventKey<Events>>(eventName: TEventName, event: Events[TEventName]): void {
        this.handler.emit(eventName, event);
    }

    pipe(emitter: EventEmitterInterface<Events>): void {
        this.handler.pipe(emitter);
    }
}