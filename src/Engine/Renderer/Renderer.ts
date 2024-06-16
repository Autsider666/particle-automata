import {Dimensions} from "../../Utility/Type/Dimensional.ts";

export interface Renderer {
    draw(): void;

    resize(dimensions: Dimensions): void;
}