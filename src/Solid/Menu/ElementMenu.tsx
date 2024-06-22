import {createSignal} from "solid-js";
import {ElementType, ParticleElement} from "../../Engine/Particle/Particle.ts";
import {MenuItemData} from "../../Engine/UI/BaseMenu.ts";
import {useEventHandler} from "../Context/EventHandlerContext.tsx";
import {BaseMenu} from "./BaseMenu.tsx";

const getElementMenuItems = (selectedElement: ElementType): MenuItemData<ParticleElement>[] => {
    const data: MenuItemData<ParticleElement>[] = [];
    let quickSelectIndex: number = 1;
    for (const elementType in ParticleElement) {
        const element: ParticleElement = ParticleElement[elementType];

        if (element.hidden) {
            continue;
        }

        data.push({
            key: element.type,
            label: `${quickSelectIndex}: ${element.type}`,
            event: element,
            style: {borderColor: element.color},
            active: selectedElement === elementType,
        });

        quickSelectIndex++;
    }

    return data;
};

type ElementMenuProps = {
    startingElement: ElementType,
}

export const ElementMenu = ({startingElement}: ElementMenuProps) => {
    const [element, setElement] = createSignal(startingElement);
    const events = useEventHandler();

    console.log(events);
    events.on('elementSelected', ({type}) => {
        console.log(type);
        if (element() !== type) {
            setElement(type);
        }
    });

    return <BaseMenu<ParticleElement>
        itemProvider={() => getElementMenuItems(element())}
        handleMenuItemActivation={(element) => {
            console.log(element);
            setElement(element.type);
            events?.emit("elementSelected", element);
        }}/>;
};