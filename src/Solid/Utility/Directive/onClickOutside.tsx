import {Accessor, onCleanup} from "solid-js";

export const onClickOutside = (element: Element, accessor: Accessor<Accessor<void>>) => {
    const onClick = (e: MouseEvent) =>
        e.target instanceof Element && !element.contains(e.target) && accessor()();

    document.body.addEventListener("pointerdown", onClick);

    onCleanup(() => document.body.removeEventListener("click", onClick));
};