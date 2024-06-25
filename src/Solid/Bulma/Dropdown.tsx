import {children, createSignal, JSX} from "solid-js";
import {useDirective} from "../Utility/Directive/directive.tsx";
import {onClickOutside} from "../Utility/Directive/onClickOutside.tsx";

type DropdownProps = {
    startOpened?: boolean,
    classList?: { [k: string]: boolean | undefined }
    generateTriggerElement: (opened: boolean) => JSX.Element,
    children: JSX.Element,
    alignRight?: boolean,
}

export const Dropdown = (props: DropdownProps) => {
    const [opened, setOpened] = createSignal<boolean>(props.startOpened ?? false);

    const memoChildren = children(() => props.children);

    return <div
        classList={{
            dropdown: true,
            'is-active': opened(),
            'is-right': props.alignRight,
            ...(props.classList ?? {})
        }}
        ref={useDirective(onClickOutside, () => setOpened(false))}
    >
        <div class="dropdown-trigger" onClick={() => setOpened(!opened())}>
            {props.generateTriggerElement(opened())}
        </div>
        <div class="dropdown-menu" role="menu" style={{"min-width": '0'}}>
            <div class="dropdown-content">
                {memoChildren()}
            </div>
        </div>
    </div>;
};