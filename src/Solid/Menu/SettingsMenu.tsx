// import {createSignal} from "solid-js";
// import {ElementType, ParticleElement} from "../../Engine/Particle/Particle.ts";
// import {useConfig} from "../Context/ConfigContext.tsx";
// import {useEventHandler} from "../Context/EventHandlerContext.tsx";
// import {BaseMenu, MenuItemData} from "./BaseMenu.tsx";
//
// const getElementMenuItems = (selectedElement: ElementType): MenuItemData<ParticleElement>[] => {
//     const data: MenuItemData<ParticleElement>[] = [];
//     let quickSelectIndex: number = 1;
//     for (const elementType in ParticleElement) {
//         const element: ParticleElement = ParticleElement[elementType];
//
//         if (element.hidden) {
//             continue;
//         }
//
//         data.push({
//             key: element.type,
//             label: `${quickSelectIndex}: ${element.type}`,
//             event: element,
//             color: element.color,
//             style: {"border-right": '5px solid ' + element.color},
//             active: selectedElement === elementType,
//         });
//
//         quickSelectIndex++;
//     }
//
//     return data;
// };
//
// type ElementMenuProps = {
//     alignRight?: boolean,
// }
//
// export const SettingsMenu = ({alignRight}: ElementMenuProps) => {
//     const {DrawElement} = useConfig();
//     const [element, setElement] = createSignal(DrawElement.value.type);
//     const events = useEventHandler();
//
//     events.on('DrawElement', ({type}) => {
//         if (element() !== type) {
//             setElement(type);
//         }
//     });
//
//     return <BaseMenu<ParticleElement>
//         alignRight={alignRight}
//         itemProvider={() => getElementMenuItems(element())}
//         handleMenuItemActivation={(element) => {
//             setElement(element.type);
//             events?.emit("DrawElement", element);
//         }}/>;
// };