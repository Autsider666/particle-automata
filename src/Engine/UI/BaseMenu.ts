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

        this.menuElement.innerHTML = `
<div class="dropdown is-active">
  <div class="dropdown-trigger">
    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
      <span>Dropdown button</span>
      <span class="icon is-small">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
      <div href="#" class="dropdown-item"> 
       <aside class="menu">
  <p class="menu-label">General</p>
  <ul class="menu-list">
    <li><a>Dashboard</a></li>
    <li><a>Customers</a></li>
  </ul>
  <p class="menu-label">Administration</p>
  <ul class="menu-list">
    <li><a>Team Settings</a></li>
    <li>
      <a class="is-active">Manage Your Team</a>
      <ul>
        <li><a>Members</a></li>
        <li><a>Plugins</a></li>
        <li><a>Add a member</a></li>
      </ul>
    </li>
    <li><a>Invitations</a></li>
    <li><a>Cloud Storage Environment Settings</a></li>
    <li><a>Authentication</a></li>
  </ul>
  <p class="menu-label">Transactions</p>
  <ul class="menu-list">
    <li><a>Payments</a></li>
    <li><a>Transfers</a></li>
    <li><a>Balance</a></li>
  </ul>
</aside>
       </div>
    </div>
  </div>
</div>
`;

        // this.updateMenu();
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