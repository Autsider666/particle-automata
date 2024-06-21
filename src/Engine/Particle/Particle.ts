import {Color, ColorVariance, HexColor, RGBATuple} from "../../Utility/Color.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";

type ImportableElement = {
    color: HexColor,
    colorVariance?: ColorVariance,
    density?: number,
    hidden?: boolean,
    ephemeral?: boolean,
    immovable?: boolean,
    fluid?: boolean,
}

type ImportableElementData = Record<string, ImportableElement>

export type ElementType = Distinct<string, 'element'>;

export type ParticleElement = Readonly<ImportableElement & {
    type: ElementType,
    colorTuple: RGBATuple,
    density: number;
    hidden: boolean,
    ephemeral: boolean,
    immovable: boolean,
    fluid: boolean,
}>

type BaseParticle = {
    readonly id: number;
    readonly element: ParticleElement,
    color: string,
    colorTuple: RGBATuple,
    dirty: boolean,
}

export type Particle<ExtraProperties extends object | undefined = undefined> = ExtraProperties extends object ? BaseParticle & Partial<ExtraProperties> : BaseParticle;

class ParticleProvider {
    private nextParticleId: number = 0;

    private readonly elements = new Map<ElementType, ParticleElement>();

    constructor(initialElements: ImportableElementData) {
        for (const [identifier, data] of Object.entries(initialElements)) {
            this.add(identifier, data);
        }
    }

    public add(identifier: string, data: Readonly<ImportableElement>) {
        const elementType = this.toElementType(identifier, true);
        if (this.elements.has(elementType)) {
            throw new Error(' Already loaded a particle type of type ' + identifier);
        }

        this.elements.set(elementType, Object.freeze({
            ...data,
            type: elementType,
            colorTuple: Color.varyColorTuple(data.color),
            density: data.density ?? 0,
            hidden: data.hidden ?? false,
            ephemeral: data.ephemeral ?? false,
            immovable: data.immovable ?? false,
            fluid: data.fluid ?? false,
        }));
    }

    public get(elementType: PossibleElementType): ParticleElement | undefined {
        return this.elements.get(this.toElementType(elementType, true));
    }

    public createParticle(elementType: PossibleElementType): Particle {
        const element = this.get(elementType);
        if (element === undefined) {
            throw new Error('Invalid element type provided: ' + elementType);
        }

        let color: HexColor | string = element.color;
        let colorTuple = Color.varyColorTuple(color);
        const colorVariance = element.colorVariance;
        if (colorVariance) {
            colorTuple = Color.varyColorTuple(color, colorVariance);
            color = Color.varyColor(color, colorVariance);
        }

        return {
            id: this.nextParticleId++,
            element,
            color,
            colorTuple,
            dirty: true,
        };
    }

    private toElementType(identifier: string, skipCheck: boolean = false): ElementType {
        const type = identifier as ElementType;
        if (skipCheck || this.elements.has(type)) {
            return type;
        }

        throw new Error('Invalid identifier');
    }
}

const genericColorVariance: ColorVariance = {
    hue: {value: 0},
    saturation: {min: -20, max: 0},
    lightness: {min: -10, max: 0},
    alpha: {value: 0},
} as const;

type BaseElementType = keyof typeof baseElements;

const baseElements = {
    Air: {
        color: '#0f1726',
        density: 1,
        maxSpeed: 0,
        acceleration: 0,
        ephemeral: true,
        canDraw: false,
    },
    Sand: {
        color: '#dcb159',
        colorVariance: genericColorVariance,
        density: 150,
        maxSpeed: 8,
        acceleration: 0.4,
        drawProbability: 0.25,
    },
    Stone: {
        color: '#8f8d8e',
        colorVariance: genericColorVariance,
        // density: 500,
        immovable: true,
    },
} as const;

const particleProvider = new ParticleProvider(baseElements);

export const ParticleBuilder = (elementType: string): Particle => particleProvider.createParticle(elementType);

export type PossibleElementType = string | BaseElementType | ElementType;

type ElementMap = Readonly<Record<PossibleElementType, ParticleElement>>;

export const ParticleElement: ElementMap = new Proxy({} as ElementMap, {
    get(_target, prop: string): ParticleElement {
        const element = particleProvider.get(prop);
        if (!element) {
            throw new Error('Unknown element type: ' + prop);
        }

        return element;
    },
});