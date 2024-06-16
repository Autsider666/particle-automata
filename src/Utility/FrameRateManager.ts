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

        this.interval = 1000.0 / fps;

        this.step();
    }

    public start():void {
        this.paused = false;
    }

    public stop():void {
        this.paused = true;
    }

    public toggle(paused: boolean = !this.paused): void {
        this.paused = paused;
    }

    public setFPS(fps: number): void {
        this.interval = 1000.0 / fps;
    }

    private step(): void {
        requestAnimationFrame(this.step.bind(this));

        this.now = Date.now();
        this.delta = this.now - this.then;

        if (this.delta > this.interval && !this.paused) {
            this.then = this.now - (this.delta % this.interval);

            this.callback();
        }
    }
}