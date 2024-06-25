import {Canvas} from "excalibur";
import {UIConfig} from "../../Engine/Config/UIConfig.ts";
import {ParticleElement} from "../../Engine/Particle/Particle.ts";
import {Color} from "../../Utility/Color.ts";

// type PointerState = {
//     isErasing: boolean,
//     overrideWorld: boolean,
//     element: ParticleElement,
//     drawRadius: number,
// }

export class Pointer extends Canvas {
    private element!:ParticleElement;
    private drawRadius!:number;

    constructor(
        public readonly maxRadius: number,
        public readonly particleSize: number,
        // private readonly state: PointerState,
    ) {
        super({
            height: 2 * (maxRadius * particleSize),
            width: 2 * (maxRadius * particleSize),
        });

        UIConfig.subscribe((config) => {
            this.element = ParticleElement[config.DrawElement];
            this.drawRadius = config.DrawSize;

            this.flagDirty();
            console.log('pointer updated');
        });
    }

    // flagDirty(stateChanges: Partial<PointerState> = {}) {
    //     super.flagDirty();
    //     for (const key of Object.keys(stateChanges) as Array<keyof PointerState>) {
    //         // @ts-expect-error Will look at this one later
    //         this.state[key] = stateChanges[key] ?? this.state[key];
    //     }
    // }

    execute(ctx: CanvasRenderingContext2D) {
        const {color, colorVariance} = this.element;

        const isErasing = false;
        const overrideWorld = false;

        const radiusSquared = Math.pow(this.drawRadius, 2);
        const outerDarius = Math.pow(this.drawRadius - 1, 2);
        for (let dX = -this.drawRadius; dX <= this.drawRadius; dX++) {
            for (let dY = -this.drawRadius; dY <= this.drawRadius; dY++) {
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

                    ctx.fillRect((this.maxRadius + dX) * this.particleSize, (this.maxRadius + dY) * this.particleSize, this.particleSize, this.particleSize);
                }
            }
        }
    }
}