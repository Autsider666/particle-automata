import {useCurrentlyHeldKey} from "@solid-primitives/keyboard";
import {createEffect, createMemo} from "solid-js";
import {changeUIConfig, UIConfig} from "../../Engine/Config/UIConfig.ts";
import {ElementType, ParticleElement} from "../../Engine/Particle/Particle.ts";
import {useStore} from "../Context/useStore.tsx";
import {BaseMenu, MenuItemData} from "./BaseMenu.tsx";

const getElementMenuItems = (type: ElementType): MenuItemData<ElementType>[] => {
    const data = [];
    let quickSelectIndex: number = 1;
    for (const elementType in ParticleElement) {
        const element: ParticleElement = ParticleElement[elementType];

        if (element.hidden) {
            continue;
        }

        data.push({
            key: element.type,
            label: `${quickSelectIndex}: ${element.type}`,
            event: element.type,
            color: element.color,
            style: {"border-right": '5px solid ' + element.color},
            active: type === elementType,
        });

        quickSelectIndex++;
    }

    return data;
};

type ElementMenuProps = {
    alignRight?: boolean,
}

export const ElementMenu = ({alignRight = false}: ElementMenuProps) => {
    const config = useStore(UIConfig);
    const key = useCurrentlyHeldKey();
    const storedMenuItems = createMemo(() => getElementMenuItems(config().DrawElement));

    createEffect(() => {
        const keyPressed = key();
        if (!keyPressed || Number.isNaN(keyPressed)) {
            return;
        }

        const elementIndex = parseInt(keyPressed);
        if (isNaN(elementIndex)) {
            return;
        }

        let quickSelectIndex: number = 0;
        for (const elementType in ParticleElement) {
            const {hidden}: ParticleElement = ParticleElement[elementType];
            if (hidden) {
                continue;
            }

            quickSelectIndex++;
            if (quickSelectIndex === elementIndex) {
                changeUIConfig('DrawElement', elementType as ElementType);
            }
        }
    });

    return <BaseMenu<ElementType>
        alignRight={alignRight}
        itemProvider={() => storedMenuItems()}
        handleMenuItemActivation={element => changeUIConfig('DrawElement', element)}
        fasIcon="fa-cubes-stacked"
    />;
};