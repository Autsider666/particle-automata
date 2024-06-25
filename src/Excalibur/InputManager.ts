import {Actor, Engine, Vector} from "excalibur";
import {SimulationEvent} from "../Engine/Simulation/SimulationInterface.ts";
import {ViewportCoordinate} from "../Engine/Type/Coordinate.ts";
import {InputEvent} from "../Engine/UI/Event.ts";
import {EventHandlerInterface} from "../Utility/Event/EventHandlerInterface.ts";
import {InputType} from "../Utility/Input/InputType.ts";
import {Coordinate, Traversal} from "../Utility/Type/Dimensional.ts";
import {Pointer} from "./Graphic/Pointer.ts";

export enum InputAction {
    // ToggleSimulation = 'ToggleSimulation',
    // StopSimulation = 'StopSimulation',
    // StartSimulation = 'StartSimulation',
    // ForceDraw = 'ForceDraw',
    // IncreaseDrawSize = 'IncreaseDrawSize',
    // DecreaseDrawSize = 'DecreaseDrawSize',
    // SelectElement = 'SelectElement',
    Draw = 'Draw',
    // Erase = 'Erase',
    Debug = 'Debug',
}

export type WorldConfig = Record<InputAction, readonly InputType[]>;

export class InputManager extends Actor {
    private isDrawing: boolean = false;
    // private overrideWorld: boolean = false;
    // private isErasing: boolean = false;
    private visibleIn: number = -1;
    private lastPointerPos?: Vector;
    private readonly config: WorldConfig = {
        // [InputAction.ToggleSimulation]: [InputType.Space],
        // [InputAction.ForceDraw]: [InputType.ShiftLeft],
        [InputAction.Draw]: [InputType.Left],
        // [InputAction.IncreaseDrawSize]: [InputType.ScrollUp],
        // [InputAction.DecreaseDrawSize]: [InputType.ScrollDown],
        // [InputAction.SelectElement]: [
        //     InputType.Digit1,
        //     InputType.Digit2,
        //     InputType.Digit3,
        //     InputType.Digit4,
        //     InputType.Digit5,
        //     InputType.Digit6,
        //     InputType.Digit7,
        //     InputType.Digit8,
        //     InputType.Digit9,
        //     InputType.Digit0,
        //     InputType.Numpad1,
        //     InputType.Numpad2,
        //     InputType.Numpad3,
        //     InputType.Numpad4,
        //     InputType.Numpad5,
        //     InputType.Numpad6,
        //     InputType.Numpad7,
        //     InputType.Numpad8,
        //     InputType.Numpad9,
        //     InputType.Numpad0,
        // ],
        // [InputAction.StopSimulation]: [],
        // [InputAction.StartSimulation]: [],
        // [InputAction.Erase]: [InputType.ControlLeft],
        [InputAction.Debug]: [InputType.AltLeft]
    };

    // private selectedElement!: ParticleElement;
    // private drawRadius: number = 3;
    // private minDrawRadius: number = 0;
    // private maxDrawRadius: number = 50;

    private readonly canvas: Pointer;

    private readonly actionMap: Record<InputAction, (props: { identifier: InputType, released?: boolean }) => void>;

    constructor(
        private readonly eventHandler: EventHandlerInterface<SimulationEvent & InputEvent>,
        // private selectedElement: ParticleElement,
        private readonly particleSize: number,
        // private drawRadius: number = 3,
        // private minDrawRadius: number = 0,
        private maxDrawRadius: number = 50,
    ) {
        // UIConfig.subscribe((config) => {
        //     this.selectedElement = ParticleElement[config.DrawElement];
        //     // this.drawRadius = config.DrawSize;
        // });

        super({
            radius: particleSize,
        });

        this.canvas = new Pointer(
            this.maxDrawRadius,
            this.particleSize,
        );

        this.graphics.add(this.canvas);
        this.graphics.visible = false;

        this.actionMap = {
            // [InputAction.ToggleSimulation]: ({released}) => this.eventHandler.emit('SimulationRunning', released === true),
            // [InputAction.StopSimulation]: () => this.eventHandler.emit('SimulationRunning', false),
            // [InputAction.StartSimulation]: () => this.eventHandler.emit('SimulationRunning', true),
            // [InputAction.ForceDraw]: ({released}) => this.toggleOverrideWorld(released === undefined ? undefined : !released),
            // [InputAction.IncreaseDrawSize]: () => this.setDrawRadius(this.drawRadius + 1),
            // [InputAction.DecreaseDrawSize]: () => this.setDrawRadius(this.drawRadius - 1),
            [InputAction.Draw]: ({released}) => {
                if (released === false) {
                    this.startDrawing();
                } else if (released === true) {
                    this.stopDrawing();
                } else {
                    this.draw(this.pos);
                }
            },
            // [InputAction.Erase]: released => this.toggleErase(released === undefined ? undefined : !released),
            [InputAction.Debug]: () => this.eventHandler.emit('debug', {
                x: this.pos.x,
                y: this.pos.y
            } as ViewportCoordinate),
            // [InputAction.SelectElement]: ({released, identifier}) => {
            //     if (!released) {
            //         return;
            //     }
            //
            //     const selectedElementIndex = parseInt(identifier.replace(/\D/g, ''));
            //
            //     let elementIndex: number = 0;
            //     for (const elementType in ParticleElement) {
            //         if (ParticleElement[elementType].hidden) {
            //             continue;
            //         }
            //
            //         elementIndex++;
            //         if (elementIndex !== selectedElementIndex) {
            //             continue;
            //         }
            //
            //         changeUIConfig('DrawElement', elementType as ElementType);
            //     }
            // }
        };
    }

    onInitialize(engine: Engine) {
        engine.input.pointers.on('wheel', ({deltaY}) => this.handleInputEvent(deltaY < 0 ? InputType.ScrollUp : InputType.ScrollDown));
        engine.input.pointers.on('down', ({button}) => this.handleInputEvent(button, false));
        engine.input.pointers.on('up', ({button}) => this.handleInputEvent(button, true));
        engine.input.keyboard.on("press", ({key}) => this.handleInputEvent(key, false));
        engine.input.keyboard.on("release", ({key}) => this.handleInputEvent(key, true));

        // engine.canvas.addEventListener('pointerenter', () => this.eventHandler.emit('onFocus', true));
        // engine.canvas.addEventListener('pointerleave', () => this.eventHandler.emit('onFocus', false));


        // this.eventHandler.on('onFocus', (hasFocus) => this.toggleVisible(hasFocus));
        // this.eventHandler.on('elementSelected', this.changeElement.bind(this));
    }

    // updatePointer(): void {
    //     // this.canvas.flagDirty({
    //     //     isErasing: this.isErasing,
    //     //     overrideWorld: this.overrideWorld,
    //     //     drawRadius: this.drawRadius,
    //     //     element: this.selectedElement,
    //     // });
    // }

    toggleVisible(visible?: boolean): void {
        const isVisible = visible === undefined ? !(this.visibleIn < 0) : visible;

        if (!isVisible) {
            this.visibleIn = -1;
            this.graphics.visible = false;
            this.stopDrawing();
        } else {
            this.visibleIn = 2;
        }
    }

    // setDrawRadius(radius: number): void {
    //     this.drawRadius = Math.max(Math.min(radius, this.maxDrawRadius), 0);
    //
    //     this.updatePointer();
    // }

    // changeElement(element: ParticleElement): void {
    //     if (!element || element.hidden || this.selectedElement === element) {
    //         return;
    //     }
    //
    //     this.selectedElement = element;
    //
    //     this.updatePointer();
    // }

    onPreUpdate(engine: Engine) {
        this.pos = engine.input.pointers.primary.lastWorldPos;

        if (!this.graphics.visible && --this.visibleIn === 0) {
            this.graphics.visible = true;
        }

        if (!this.isDrawing) {
            return;
        }

        if (this.lastPointerPos) {
            Traversal.iterateBetweenTwoCoordinates(
                this.lastPointerPos,
                engine.input.pointers.primary.lastWorldPos,
                this.draw.bind(this),
            );
        }

        this.lastPointerPos = this.pos.clone();
    }

    // private toggleOverrideWorld(force?: boolean): void {
    //     if (force === undefined) {
    //         this.overrideWorld = !this.overrideWorld;
    //     } else {
    //         this.overrideWorld = force;
    //     }
    //
    //     this.updatePointer();
    // }

    // private toggleErase(force?: boolean): void {
    //     if (force === undefined) {
    //         this.isErasing = !this.isErasing;
    //     } else {
    //         this.isErasing = force;
    //     }
    //
    //     this.updatePointer();
    // }

    private draw({x, y}: Coordinate): void {
        console.log('drawing',x,y);
        // this.eventHandler.emit('replaceParticles', {
        //     element: this.isErasing ? ParticleElement.Air : this.selectedElement,
        //     coordinate: {x, y} as ViewportCoordinate, // To prevent vectors
        //     radius: this.drawRadius,
        //     // probability: Elements[this.selectedElement].drawProbability,
        //     // force: this.overrideWorld || this.isErasing,
        // });
    }

    private startDrawing(): void {
        if (this.isDrawing) {
            return;
        }

        this.isDrawing = true;
    }

    private stopDrawing(): void {
        if (!this.isDrawing) {
            return;
        }

        this.isDrawing = false;
        this.lastPointerPos = undefined;
    }

    private handleInputEvent(identifier: InputType, released?: boolean): void {
        for (const action of Object.keys(this.config) as InputAction[]) {
            for (const inputType of this.config[action]) {
                if (identifier === inputType) {
                    this.actionMap[action]({released, identifier});
                }
            }
        }
    }
}