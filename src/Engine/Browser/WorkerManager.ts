import {EventEmitterInterface} from "../../Utility/Event/EventEmitterInterface.ts";
import {Config} from "../Type/Config.ts";
import {WorkerMessage} from "../Type/WorkerMessage.ts";
import {MessageHandler} from "../Worker/Event/MessageHandler.ts";
import WebWorker from './../Worker/WebWorker.ts?worker';

export class WorkerManager<Events extends WorkerMessage = WorkerMessage> {
    private readonly worker: Worker;
    private readonly handler: MessageHandler<Events>;

    constructor(
        config: Config,
    ) {
        const workerConfig = config.worker;
        if (!workerConfig) {
            throw new Error('Can\'t create WorkerManager without worker config');
        }

        const canvas = document.querySelector<HTMLCanvasElement>(workerConfig.canvasIdentifier);
        if (!canvas) {
            throw new Error('No canvas matching canvasIdentifier found: ' + workerConfig.canvasIdentifier);
        }

        // canvas.height = excaliburCanvas.height;
        // canvas.width = excaliburCanvas.width;

        this.worker = new WebWorker();
        this.worker.onmessage = event => console.log(event.data);
        this.worker.onerror = event => console.error(event);

        this.handler = new MessageHandler<Events>(this.worker);

        const offscreenCanvas = canvas.transferControlToOffscreen();

        this.handler.emit('init', {
            canvas: offscreenCanvas,
            config,
        }, [offscreenCanvas]);
    }

    public pipeWorkerEvents(handler: EventEmitterInterface<Events>): void {
        this.handler.pipe(handler);
    }

    public pipeEventsToWorker(handler: EventEmitterInterface<Events>): void {
        handler.pipe(this.handler);
    }
}