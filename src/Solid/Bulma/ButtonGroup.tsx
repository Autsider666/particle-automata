import {JSX} from "solid-js";
import {Size} from "./Type.ts";

type ButtonGroupProps = {
    align?: 'left' | 'center' | 'right',
    children: JSX.Element,
    size?: Size,
}

export const ButtonGroup = ({
                                align = 'left',
                                children,
                                size,
                            }: ButtonGroupProps) => {
    return <div classList={{
        buttons: true,
        'is-vcentered': true,
        'has-addons': true,
        'is-centered': align === 'center',
        'is-right': align === 'right',
        [`are-${size}`]: size !== undefined,
    }}>
        {children}
    </div>;
};