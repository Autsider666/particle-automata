export class FrameRateManager {
    private now: number = 0;
    private then: number = Date.now();
    private delta: number = 0;
    private interval: number;

    constructor(
        private readonly updateCallback: () => void,
        private readonly drawCallback: () => void,
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

    public update(): void {
        this.updateCallback();
    }

    public draw(): void {
        this.drawCallback();
    }

    public start(): void {
        this.paused = false;
    }

    public stop(): void {
        this.paused = true;
    }

    public toggle(): void {
        this.paused = !this.paused;
    }

    public setFPS(fps: number): void {
        this.interval = 1000.0 / fps;
    }

    private step(): void {
        requestAnimationFrame(this.step.bind(this));
        if (this.interval === 0 || this.paused) {
            return;
        }

        this.now = Date.now();
        this.delta = this.now - this.then;

        if (this.delta > this.interval) {
            this.then = this.now - (this.delta % this.interval);

            this.update();
            this.draw();
        }
    }
}