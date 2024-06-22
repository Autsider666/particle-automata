import {createSignal, For} from "solid-js";
import {MenuItemData} from "../../Engine/UI/BaseMenu.ts";
import {useDirective} from "../Utility/Directive/directive.tsx";
import {onClickOutside} from "../Utility/Directive/onClickOutside.tsx";

type BaseMenuProps<T> = {
    itemProvider: () => MenuItemData<T>[],
    handleMenuItemActivation: (event: T) => void,
}

export const BaseMenu = <T, >({
                                  itemProvider,
                                  handleMenuItemActivation
                              }: BaseMenuProps<T>) => {
    const [opened, setOpened] = createSignal(false);

    return <div
        class={opened() ? "dropdown is-active" : "dropdown"}
        ref={useDirective(onClickOutside, () => setOpened(false))}
    >
        <div class="dropdown-trigger" onClick={() => setOpened(!opened())}>
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span>{itemProvider().filter(({active}) => active).map(({label, key}) => label ?? key)}</span>
                <span class="icon is-small">
                    <i class={opened() ? "fas fa-angle-up" : "fas fa-angle-down"} aria-hidden="true"></i>
                </span>
            </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
                <div class="dropdown-item">
                    <aside class="menu">
                        <p class="menu-label">Elements</p>
                        <ul class="menu-list">
                            <For each={itemProvider()}>
                                {({key, label, event, active}) => <li>
                                    <button onClick={() => handleMenuItemActivation(event)}
                                            class={active ? "is-active" : ""}>{label ?? key}</button>
                                </li>}
                            </For>
                        </ul>
                    </aside>
                </div>
            </div>
        </div>
    </div>;
};