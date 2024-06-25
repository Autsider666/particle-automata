import {persistentMap} from "@nanostores/persistent";
import {URLParams} from "../../Utility/URLParams.ts";
import {ParticleElement} from "../Particle/Particle.ts";
import {InputEvent} from "../UI/Event.ts";

type EventConfig<Events> = {
    [K in keyof Events]: Events[K]
};

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

export const isValidUIConfigValue = <K extends keyof InputEvent>(type: K, value: InputEvent[K]): boolean => {
    switch (type) {
        case "ShowStats":
        case "SimulationRunning":
        case "DrawElement":
            return true;
        case "DrawSize":
            return isNumber(value) && value >= 0 && value <= 10;
        default:
            throw new Error('Unknown UIConfig type: ' + type);
    }
};

export const UIConfig = persistentMap<EventConfig<InputEvent>>('config:ui:', {
    DrawElement: ParticleElement.Air.type,
    DrawSize: 1,
    ShowStats: URLParams.get('stats', "boolean") ?? false, //TODO onMount to override using url?
    SimulationRunning: URLParams.get('autoStart', "boolean") ?? true
}, {
    encode(value: unknown) {
        return JSON.stringify(value);
    },
    decode(value: string) {
        return JSON.parse(value);
    }
});

export const changeUIConfig =  <K extends keyof InputEvent>(type: K, value: InputEvent[K]) => UIConfig.setKey(type, value);