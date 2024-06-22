import {StringHelper} from "../../Utility/StringHelper.ts";

export type MenuItemData<T> = {
    key: string,
    label?: string,
    event: T,
    style?: Partial<CSSStyleDeclaration>,
    className?: string[],
    active?:boolean,
}

export class BaseMenu<T> {
    private readonly menuElement: HTMLDivElement;

    constructor(
        rootElement: HTMLElement,
        private readonly itemProvider: () => MenuItemData<T>[],
        private readonly handleMenuItemActivation: (event: T) => void,
        menuId: string,
        className: string[] = [],
    ) {
        this.menuElement = document.createElement('div');
        this.menuElement.id = menuId;
        this.menuElement.classList.add('menu', ...className);
        rootElement.appendChild(this.menuElement);

        this.updateMenu();
    }

    public updateMenu(): void {
        for (const {key, label, event, style, className = [],active = false} of this.itemProvider()) {
            const itemIdentifier = StringHelper.toClassName(key);
            let menuItemElement = this.menuElement.querySelector<HTMLButtonElement>(`.menu-item.${itemIdentifier}`);

            if (!menuItemElement) {
                menuItemElement = document.createElement('button');
                menuItemElement.classList.add('menu-item', itemIdentifier, ...className);
                if (style) {
                    for (const [key, value] of Object.entries(style)) {
                        // @ts-expect-error css style is weird.
                        menuItemElement.style[key as keyof CSSStyleDeclaration] = value;
                    }
                }

                menuItemElement.addEventListener('click', () => this.handleMenuItemActivation(event));

                this.menuElement.appendChild(menuItemElement);
            }

            if(active) {
                menuItemElement.classList.add('active');
            } else {
                menuItemElement.classList.remove('active');
            }

            menuItemElement.innerHTML = label ?? key;
        }
    }
}