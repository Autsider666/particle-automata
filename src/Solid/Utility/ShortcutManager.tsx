import {createShortcut} from "@solid-primitives/keyboard";
import {onCleanup, onMount} from "solid-js";
import {changeUIConfig, isValidUIConfigValue, UIConfig} from "../../Engine/Config/UIConfig.ts";
import {useStore} from "../Context/useStore.tsx";

export const ShortcutManager = () => {
    const config = useStore(UIConfig);

    onMount(() => {
        document.addEventListener('wheel', handleScroll);
    });

    onCleanup(() => {
        document.removeEventListener('wheel', handleScroll);
    });

    const handleScroll = ({deltaY}: WheelEvent) => {
        const nextSize = config().DrawSize + (deltaY < 0 ? +1 : -1);
        if (isValidUIConfigValue('DrawSize', nextSize)) {
            changeUIConfig('DrawSize', nextSize);
        }
    };

    createShortcut([' '],
        () => changeUIConfig('SimulationRunning', !config().SimulationRunning), {
            preventDefault: true,
            requireReset: true,
        });

    createShortcut(['wheel'],
        () => console.log('wheel'), {
            preventDefault: true,
            requireReset: true,
        });

    return undefined;
};