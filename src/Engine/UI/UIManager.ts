import DynamicEventListener from "../../Utility/DynamicEventListener.ts";
import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";
import {ElementType, ParticleElement} from "../Particle/Particle.ts";
import {BaseMenu, MenuItemData} from "./BaseMenu.ts";
import {UIConfig} from "./Config.ts";
import {InputEvent} from "./Event.ts";

export class UIManager {
    private readonly uiElement: HTMLDivElement;
    private selectedElement: ElementType;
    private readonly elementMenu: BaseMenu<ParticleElement>;

    constructor(
        private readonly eventHandler: EventHandlerInterface<InputEvent>,
        rootElement: HTMLElement,
        config: UIConfig,
    ) {
        this.uiElement = document.createElement('div');
        this.uiElement.id = 'ui';
        rootElement.appendChild(this.uiElement);

        this.selectedElement = config.defaultParticleElement;
        this.elementMenu = new BaseMenu<ParticleElement>(
            this.uiElement,
            this.getElementMenuItems.bind(this),
            this.handleElementMenuItem.bind(this),
            'elements',
        );

        // DynamicEventListener.register('button#clear', 'click', () => this.eventHandler.emit('restart',undefined));
        DynamicEventListener.register('button#play', 'click', () => this.eventHandler.emit('setRunning', true));
        DynamicEventListener.register('button#pause', 'click', () => this.eventHandler.emit('setRunning', false));

        rootElement.addEventListener('pointerenter', () => this.eventHandler.emit('onFocus', true));
        rootElement.addEventListener('pointerleave', () => this.eventHandler.emit('onFocus', false));

        this.eventHandler.on('elementSelected', ({type}) => {
            if (type !== this.selectedElement) {
                this.selectedElement = type;
                this.elementMenu.updateMenu();
            }
        });
    }

    private getElementMenuItems(): MenuItemData<ParticleElement>[] {
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
                active: this.selectedElement === elementType,
            });

            quickSelectIndex++;
        }

        return data;
    }

    private handleElementMenuItem(element: ParticleElement): void {
        this.eventHandler.emit('elementSelected', element);
        this.elementMenu.updateMenu();
    }
}