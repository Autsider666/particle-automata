import {children, JSX} from "solid-js";
import {Size} from "./Type.ts";

export type ButtonProps = {
    children?: JSX.Element,
    disabled?: boolean,
    inverted?: boolean,
    onClick?: () => void
    outlined?: boolean,
    responsive?: boolean,
    rounded?: boolean,
    selected?: boolean,
    size?: Size,
    static?: boolean,
    tooltip?: string,
};

// TODO doesn't children deconstruction cause an issue here?
export const Button = (props: ButtonProps) => {
    const memoChildren = children(() => props.children);

    return <button
        classList={{
            button: true,
            'is-inverted': props.inverted,
            'is-outlined': props.outlined,
            'is-responsive': props.responsive,
            'is-rounded': props.rounded,
            'is-selected': props.selected,
            [`is-${props.size}`]: props.size !== undefined,
            'has-tooltip-arrow': props.tooltip !== undefined,
            'has-tooltip-bottom': props.tooltip !== undefined,
            'is-static': props.static,
        }}
        disabled={props.disabled}
        onClick={props.onClick}
        data-tooltip={props.tooltip}
        style={{cursor: props.disabled ? "not-allowed" : "pointer"}}
    >
        {memoChildren()}
    </button>;
};