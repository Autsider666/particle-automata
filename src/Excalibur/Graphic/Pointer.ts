import {Canvas} from "excalibur";
import {ParticleElement} from "../../Engine/Particle/Particle.ts";
import {Color} from "../../Utility/Color.ts";

type PointerState = {
    isErasing: boolean,
    overrideWorld: boolean,
    element: ParticleElement,
    drawRadius: number,
}

export class Pointer extends Canvas {
    constructor(
        public readonly radius: number,
        public readonly particleSize: number,
        private readonly state: PointerState,
    ) {
        super({
            height: 2 * (radius * particleSize),
            width: 2 * (radius * particleSize),
        });
    }

    flagDirty(stateChanges: Partial<PointerState> = {}) {
        super.flagDirty();
        for (const key of Object.keys(stateChanges) as Array<keyof PointerState>) {
            // @ts-expect-error Will look at this one later
            this.state[key] = stateChanges[key] ?? this.state[key];
        }
    }

    execute(ctx: CanvasRenderingContext2D) {
        const {element, drawRadius, isErasing, overrideWorld} = this.state;
        const {color, colorVariance} = element;

        const radiusSquared = Math.pow(drawRadius, 2);
        const outerDarius = Math.pow(drawRadius - 1, 2);
        for (let dX = -drawRadius; dX <= drawRadius; dX++) {
            for (let dY = -drawRadius; dY <= drawRadius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared) {
                    if (!isErasing) {
                        let resultingColor: string = color;
                        if (colorVariance) {
                            resultingColor = Color.varyColor(
                                color,
                                {
                                    ...colorVariance,
                                    alpha: {value: overrideWorld ? 0 : -0.2},
                                }
                            );
                        }

                        ctx.fillStyle = resultingColor;
                    } else if (dX * dX + dY * dY >= outerDarius) {
                        ctx.fillStyle = 'rgba(255,0,0,0.50)';
                    } else {
                        ctx.fillStyle = '#00000000';
                    }

                    ctx.fillRect((this.radius + dX) * this.particleSize, (this.radius + dY) * this.particleSize, this.particleSize, this.particleSize);
                }
            }
        }
    }
}