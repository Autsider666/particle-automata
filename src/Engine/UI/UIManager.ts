import DynamicEventListener from "../../Utility/DynamicEventListener.ts";
import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";
import {ElementType, ParticleElement} from "../Particle/Particle.ts";
import {UIConfig} from "./Config.ts";
import {UIEvent} from "./Event.ts";

export class UIManager {
    private readonly uiElement: HTMLDivElement;
    private readonly menuElement: HTMLDivElement;
    private selectedElement: ElementType;


    constructor(
        private readonly eventHandler: EventHandlerInterface<UIEvent>,
        rootElement: HTMLElement,
        config: UIConfig,
    ) {
        this.selectedElement = config.defaultParticleElement;

        this.uiElement = document.createElement('div');
        this.uiElement.id = 'ui';
        // this.uiElement.style.zIndex = 100;
        rootElement.appendChild(this.uiElement);


        this.menuElement = document.createElement('div');
        this.menuElement.id = 'menu';
        this.menuElement.classList.add('elements', 'btn-group');
        this.uiElement.appendChild(this.menuElement);

        this.updateMenu();

        // DynamicEventListener.register('button#clear', 'click', () => this.eventHandler.emit('restart',undefined));
        DynamicEventListener.register('button#play', 'click', () => this.eventHandler.emit('setRunning', true));
        DynamicEventListener.register('button#pause', 'click', () => this.eventHandler.emit('setRunning', false));

        rootElement.addEventListener('pointerenter', () => this.eventHandler.emit('onFocus', true));
        rootElement.addEventListener('pointerleave', () => this.eventHandler.emit('onFocus', false));

        this.eventHandler.on('elementSelected', this.setActiveElement.bind(this));

    }

    private updateMenu(): void {
        let quickSelectIndex: number = 1;
        for (const elementType in ParticleElement) {
            const element: ParticleElement = ParticleElement[elementType];
            let elementButton = this.menuElement.querySelector<HTMLButtonElement>(`.element[data-type="${element.type}"]`);

            if (!elementButton) {
                elementButton = document.createElement('button');
                // elementButton.innerHTML = element.type;
                elementButton.classList.add('element');
                elementButton.dataset.type = elementType;
                elementButton.style.borderColor = element.color;

                elementButton.addEventListener('click', () => this.setActiveElement(element));

                this.menuElement.appendChild(elementButton);
            }

            if (element.hidden) {
                elementButton.classList.add('hidden');
            } else {
                elementButton.innerHTML = `${quickSelectIndex}: ${element.type}`;
                quickSelectIndex++;
                elementButton.classList.remove('hidden');
            }

            if (this.selectedElement === elementType) {
                elementButton.classList.add('active');
            } else {
                elementButton.classList.remove('active');
            }
        }
    }

    private setActiveElement(element: ParticleElement): void {
        if (element.hidden || element.type === this.selectedElement) {
            return;
        }

        this.selectedElement = element.type;
        this.updateMenu();

        this.eventHandler.emit('elementSelected', element);
    }
}