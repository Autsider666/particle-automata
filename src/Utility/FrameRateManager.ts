export class FrameRateManager {
    private now: number = 0;
    private then: number = Date.now();
    private delta: number = 0;
    private interval: number;

    constructor(
        private readonly callback: () => void,
        fps: number,
        private paused: boolean = false,
    ) {

        if (fps === 0) {
            this.paused = true;
            this.interval = 0;
        } else {
            this.interval = 1000.0 / fps;
        }

        this.step();
    }

    public runCallback(): void {
        this.callback();
    }

    public start(): void {
        this.paused = false;
    }

    public stop(): void {
        this.paused = true;
    }

    public isRunning(): boolean {
        return !this.paused;
    }

    public toggle(): void {
        this.paused = !this.paused;
    }

    public setFPS(fps: number): void {
        this.interval = 1000.0 / fps;
    }

    private step(): void { //FIXME https://stackoverflow.com/a/34151659
        requestAnimationFrame(this.step.bind(this));
        if (this.interval === 0 || this.paused) {
            return;
        }

        this.now = Date.now();
        this.delta = this.now - this.then;

        if (this.delta > this.interval) {
            this.then = this.now - (this.delta % this.interval);

            this.runCallback();
        }
    }
}