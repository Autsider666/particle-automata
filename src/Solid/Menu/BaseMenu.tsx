import {For, JSX} from "solid-js";
import {Dropdown} from "../Bulma/Dropdown.tsx";
import {FasIcon, FasIconType} from "../Bulma/FasIcon.tsx";

export type MenuItemData<T> = {
    key: string,
    label?: string,
    color?: string,
    event: T,
    style?: JSX.CSSProperties,
    className?: string[],
    active?: boolean,
}

type BaseMenuProps<T> = {
    itemProvider: () => MenuItemData<T>[],
    handleMenuItemActivation: (event: T) => void,
    alignRight?: boolean,
    fasIcon?: FasIconType,
}

export const BaseMenu = <T, >({
                                  itemProvider,
                                  handleMenuItemActivation,
                                  alignRight = false,
                                  fasIcon = 'fa-bars'
                              }: BaseMenuProps<T>) => {
    const baseMenuItemClasses = 'dropdown-item';

    const generateTriggerElement = (opened: boolean) => <>{itemProvider().filter(({active}) => active).map(({color}) =>
        <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu"
                style={{"border-color": color, "border-width": '3px'}}>
            <FasIcon icon={opened ? 'fa-xmark' : fasIcon} />
                    {/*<span class="icon is-small">*/}
                    {/*    <i classList={{*/}
                    {/*        fas: true,*/}
                    {/*        'fa-xmark': opened,*/}
                    {/*        [fasIcon]: !opened,*/}
                    {/*    }} aria-hidden="true"></i>*/}
                    {/*</span>*/}
        </button>
    )}</>;

    return <Dropdown
        generateTriggerElement={generateTriggerElement}
        classList={{
            'is-pulled-right': alignRight,
        }}
        alignRight={alignRight}
    >
        <div class="dropdown-item">
            <aside class="menu">
                <p class="menu-label">Elements</p>
            </aside>
        </div>
        <For each={itemProvider()}>
            {({key, label, event, active, style}) =>
                <button
                    onClick={() => handleMenuItemActivation(event)}
                    class={active ? "is-active " + baseMenuItemClasses : baseMenuItemClasses}
                    style={style}
                >{label ?? key}</button>}
        </For>
    </Dropdown>;

    // return <div
    //     classList={{
    //         dropdown: true,
    //         'is-active': opened(),
    //         'is-right': align === 'right',
    //         'is-pulled-right': align === 'right',
    //     }}
    //     ref={useDirective(onClickOutside, () => setOpened(false))}
    // >
    //     <div class="dropdown-trigger" onClick={() => setOpened(!opened())}>
    //
    //
    //     </div>
    //     <div class="dropdown-menu" id="dropdown-menu" role="menu" style={{"min-width": '0'}}>
    //         <div class="dropdown-content">
    //
    //         </div>
    //     </div>
    // </div>;
};