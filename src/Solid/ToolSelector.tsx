import {For} from "solid-js";
import {changeUIConfig, isValidUIConfigValue, UIConfig} from "../Engine/Config/UIConfig.ts";
import {InputEvent} from "../Engine/UI/Event.ts";
import {Button} from "./Bulma/Button.tsx";
import {ButtonGroup} from "./Bulma/ButtonGroup.tsx";
import {FasIcon, FasIconType} from "./Bulma/FasIcon.tsx";
import {useStore} from "./Context/useStore.tsx";

export const inputEventsInToolSelector: (keyof InputEvent)[] = [
    "SimulationRunning",
    "DrawSize"
] as const;

const configMapping: {
    [K in keyof InputEvent]: InputEvent[K] extends string ? undefined : {
        increase: {
            label: string,
            icon: FasIconType,
        },
        decrease: {
            label: string,
            icon: FasIconType,
        },
    } | undefined
} = {
    ShowStats: undefined,
    SimulationRunning: {
        increase: {
            label: "Play",
            icon: "fa-play"
        },
        decrease: {
            label: "Pause",
            icon: "fa-pause"
        }
    },
    DrawSize: {
        increase: {
            label: "Increase Brush Size",
            icon: "fa-expand"
        },
        decrease: {
            label: "Decrease Brush Size",
            icon: "fa-compress"
        }
    },
    DrawElement: undefined
};


export const ToolSelector = () => {
    const config = useStore(UIConfig);

    return <div class="field is-grouped is-grouped-centered">
        <For each={inputEventsInToolSelector}>
            {(event) => {
                const configMap = configMapping[event as keyof InputEvent];
                if (configMap === undefined) {
                    return undefined;
                }

                const getValue = <K extends keyof InputEvent, R extends InputEvent[K] = InputEvent[K]>(type: K): R => config()[type] as R;

                if (typeof getValue(event) === "boolean") {
                    return <Button
                        size="small"
                        tooltip={getValue(event) ? configMap.decrease.label : configMap.increase.label}
                        onClick={() => changeUIConfig(event, !getValue(event))}
                    >
                        <FasIcon icon={getValue(event) ? configMap.decrease.icon : configMap.increase.icon}/>
                    </Button>;
                }

                if (typeof getValue(event) === "number") {
                    return <ButtonGroup size="small">
                        <Button
                            tooltip={configMap.decrease.label}
                            disabled={!isValidUIConfigValue(event, getValue<keyof InputEvent, number>(event) - 1)}
                            onClick={() => changeUIConfig(event, getValue<keyof InputEvent, number>(event) - 1)}
                        >
                            <FasIcon icon={configMap.decrease.icon}/>
                        </Button>
                        <Button static>{getValue<keyof InputEvent, number>(event)}</Button>
                        <Button
                            tooltip={configMap.increase.label}
                            disabled={!isValidUIConfigValue(event, getValue<keyof InputEvent, number>(event) + 1)}
                            onClick={() => changeUIConfig(event, getValue<keyof InputEvent, number>(event) + 1)}
                        >
                            <FasIcon icon={configMap.increase.icon}/>
                        </Button>
                    </ButtonGroup>;
                }

                return undefined;
            }}
        </For>
    </div>;
};