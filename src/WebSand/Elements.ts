type ElementIdentifier = string;

type ReactionReach = {
    element: ElementData,
    becomes: ElementData,
    minimum: number,
    maximum: number,
    affects: number,
}

type Reaction = {
    chance: number,
    becomes: ElementData,
    explosive?: number,
    singleNeighbor?: ReactionReach,
    multiNeighbor?: ReactionReach[]
}

export type ElementData = {
    id: number,
    red: number, green: number, blue: number,
    density: number, gravity: number, slip: number, slide: number, scatter: number,
    reactions: Reaction[],
    selfReactions: Reaction[],
    immobile?: boolean,
    hidden?: boolean,
}

export const elements: Record<ElementIdentifier, ElementData> = {
    void: {
        red: 0, green: 0, blue: 0,
        density: 0, gravity: 0, slip: 0, slide: 0, scatter: 0,
        reactions: [],
        selfReactions: [],
    },
    wall: {
        red: 0.5, green: 0.5, blue: 0.5,
        density: 1, gravity: 0, slip: 0, slide: 0, scatter: 0,
        immobile: true,
        reactions: [],
        selfReactions: [],
    },
    sand: {
        red: 1.0, green: 0.8, blue: 0.2,
        density: 0.7, gravity: 0.8, slip: 0, slide: 0.8, scatter: 0,
        reactions: [],
        selfReactions: [],
    },
    salt: {
        red: 0.8, green: 0.8, blue: 0.8,
        density: 0.6, gravity: 0.75, slip: 0.05, slide: 0.7, scatter: 0,
        reactions: [],
        selfReactions: [],
    },
    water: {
        red: 0, green: 0.4, blue: 1,
        density: 0.5, gravity: 0.8, slip: 0.95, slide: 0, scatter: 0.35,
        reactions: [],
        selfReactions: [],
    },
    plant: {
        red: 0.2, green: 0.8, blue: 0,
        density: 1, gravity: 0, slip: 0, slide: 0, scatter: 0,
        immobile: true,
        reactions: [],
        selfReactions: [],
    },
    fire: {
        red: 0.9, green: 0.2, blue: 0.1,
        density: -0.5, gravity: -0.2, slip: 0, slide: 0, scatter: 0.8,
        reactions: [],
        selfReactions: [],
    },
    oil: {
        red: 0.6, green: 0.4, blue: 0.15,
        density: 0.4, gravity: 0.75, slip: 0.75, slide: 0, scatter: 0.2,
        reactions: [],
        selfReactions: [],
    },
    nitro: {
        red: 0.1, green: 0.5, blue: 0,
        density: 0.3, gravity: 0.9, slip: 0.5, slide: 0, scatter: 0,
        reactions: [],
        selfReactions: [],
    },
    spout: {
        red: 0.5, green: 0.7, blue: 1.0,
        density: 1, gravity: 0, slip: 0, slide: 0, scatter: 0,
        immobile: true,
        reactions: [],
        selfReactions: [],
    },
    torch: {
        red: 0.4, green: 0.1, blue: 0,
        density: 1, gravity: 0, slip: 0, slide: 0, scatter: 0,
        immobile: true,
        reactions: [],
        selfReactions: [],
    },
    well: {
        red: 0.5, green: 0.3, blue: 0,
        density: 1, gravity: 0, slip: 0, slide: 0, scatter: 0,
        immobile: true,
        reactions: [],
        selfReactions: [],
    },
    saltwater: {
        red: 0.1, green: 0.45, blue: 1,
        density: 0.51, gravity: 0.8, slip: 0.95, slide: 0, scatter: 0.25,
        hidden: true,
        reactions: [],
        selfReactions: [],
    },
    steam: {
        red: 0.3, green: 0.65, blue: 0.8,
        density: -0.2, gravity: -0.2, slip: 0, slide: 0, scatter: 0.4,
        hidden: true,
        reactions: [],
        selfReactions: [],
    },
    glass: {
        red: 0.9, green: 0.92, blue: 0.92,
        density: 1, gravity: 0, slip: 0, slide: 0, scatter: 0,
        immobile: true,
        hidden: true,
        reactions: [],
        selfReactions: [],
    },
} as unknown as Record<ElementIdentifier, ElementData>;

let elementId = 0;
for (const elementName in elements) {
    elements[elementName].id = elementId++;
}

elements.fire.selfReactions.push({
    chance: 0.2,
    becomes: elements.void,
});

elements.fire.reactions.push({
    chance: 0.75,
    becomes: elements.void,
    singleNeighbor: {
        element: elements.void,
        becomes: elements.fire,
        minimum: 1,
        maximum: 6,
        affects: 1,
    },
});

elements.fire.reactions.push({
    chance: 0.85,
    becomes: elements.void,
    singleNeighbor: {
        element: elements.water,
        becomes: elements.steam,
        minimum: 1,
        maximum: 8,
        affects: 4,
    },
});

elements.fire.reactions.push({
    chance: 0.85,
    becomes: elements.fire,
    singleNeighbor: {
        element: elements.plant,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 4,
    },
});

elements.fire.reactions.push({
    chance: 0.98,
    becomes: elements.fire,
    singleNeighbor: {
        element: elements.oil,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 5,
    },
});

elements.fire.reactions.push({
    chance: 0.25,
    explosive: 2,
    becomes: elements.fire,
    singleNeighbor: {
        element: elements.nitro,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 1,
    },
});

elements.fire.reactions.push({
    chance: 0.9,
    explosive: 2,
    becomes: elements.fire,
    singleNeighbor: {
        element: elements.nitro,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 2,
    },
});

elements.sand.reactions.push({
    chance: 0.45,
    becomes: elements.glass,
    singleNeighbor: {
        element: elements.fire,
        becomes: elements.fire,
        minimum: 2,
        maximum: 8,
        affects: 0,
    },
});

elements.plant.reactions.push({
    chance: 0.007,
    becomes: elements.plant,
    singleNeighbor: {
        element: elements.water,
        becomes: elements.plant,
        minimum: 1,
        maximum: 8,
        affects: 2,
    },
});

elements.plant.reactions.push({
    chance: 0.025,
    becomes: elements.plant,
    singleNeighbor: {
        element: elements.water,
        becomes: elements.void,
        minimum: 1,
        maximum: 8,
        affects: 2,
    },
});

elements.plant.reactions.push({
    chance: 0.2,
    becomes: elements.plant,
    multiNeighbor: [
        {
            element: elements.water,
            becomes: elements.plant,
            minimum: 1,
            maximum: 8,
            affects: 1,
        },
        {
            element: elements.plant,
            becomes: elements.plant,
            minimum: 0,
            maximum: 2,
            affects: 0,
        },
    ],
});

elements.plant.reactions.push({
    chance: 0.2,
    becomes: elements.plant,
    multiNeighbor: [
        {
            element: elements.water,
            becomes: elements.plant,
            minimum: 1,
            maximum: 8,
            affects: 1,
        },
        {
            element: elements.plant,
            becomes: elements.plant,
            minimum: 0,
            maximum: 4,
            affects: 0,
        },
    ],
});

elements.water.reactions.push({
    chance: 0.95,
    becomes: elements.saltwater,
    singleNeighbor: {
        element: elements.salt,
        becomes: elements.void,
        minimum: 1,
        maximum: 8,
        affects: 1,
    },
});

elements.saltwater.reactions.push({
    chance: 0.85,
    becomes: elements.salt,
    singleNeighbor: {
        element: elements.fire,
        becomes: elements.steam,
        minimum: 1,
        maximum: 8,
        affects: 1,
    },
});

elements.steam.selfReactions.push({
    chance: 0.008,
    becomes: elements.water,
});

elements.steam.reactions.push({
    chance: 0.8,
    becomes: elements.water,
    singleNeighbor: {
        element: elements.steam,
        becomes: elements.water,
        minimum: 3,
        maximum: 8,
        affects: 2,
    },
});

elements.steam.reactions.push({
    chance: 0.05,
    becomes: elements.void,
    singleNeighbor: {
        element: elements.void,
        becomes: elements.steam,
        minimum: 1,
        maximum: 8,
        affects: 1,
    },
});

elements.torch.reactions.push({
    chance: 0.75,
    becomes: elements.torch,
    singleNeighbor: {
        element: elements.void,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 2,
    },
});

elements.torch.reactions.push({
    chance: 0.4,
    becomes: elements.torch,
    singleNeighbor: {
        element: elements.water,
        becomes: elements.steam,
        minimum: 1,
        maximum: 8,
        affects: 1,
    },
});

elements.torch.reactions.push({
    chance: 0.2,
    becomes: elements.torch,
    singleNeighbor: {
        element: elements.oil,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 2,
    },
});

elements.torch.reactions.push({
    chance: 0.4,
    becomes: elements.torch,
    singleNeighbor: {
        element: elements.nitro,
        becomes: elements.fire,
        minimum: 1,
        maximum: 8,
        affects: 3,
    },
});

elements.spout.reactions.push({
    chance: 0.12,
    becomes: elements.spout,
    singleNeighbor: {
        element: elements.void,
        becomes: elements.water,
        minimum: 1,
        maximum: 8,
        affects: 1,
    },
});

elements.well.reactions.push({
    chance: 0.13,
    becomes: elements.well,
    singleNeighbor: {
        element: elements.void,
        becomes: elements.oil,
        minimum: 1,
        maximum: 7,
        affects: 1,
    },
});
