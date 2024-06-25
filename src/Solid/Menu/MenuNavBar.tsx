import {For, JSXElement} from "solid-js";

type MenuNavBarProps = {
    left?: JSXElement[],
    center?: JSXElement[],
    right?: JSXElement[],
    // children: JSXElement,
};

export const MenuNavBar = (props: MenuNavBarProps) => {
    return <div class="menu-nav-bar disable-pointer columns is-mobile" style={{right: 0}}>
        <div class="column left">
            <For each={props.left}>
                {item => item}
            </For>
        </div>
        <div class="column is-half has-text-centered center">
            <For each={props.center}>
                {item => item}
            </For>
        </div>

        <div class="column has-text-right right">
            <For each={props.right}>
                {item => item}
            </For>
        </div>
    </div>;
};