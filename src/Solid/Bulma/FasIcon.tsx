import {Size} from "./Type.ts";

type FasIconProps = {
    icon: FasIconType,
    size?: Size
}

// https://fontawesome.com/search?o=r&m=free
export type FasIconType = `fa-${string}`;

export const FasIcon = (props: FasIconProps) => <span
    classList={{
        icon: true,
        [`is-${props.size ?? 'normal'}`]: true,
    }}
>
      <i classList={{
          fas: true,
          [props.icon]: true,
      }}></i>
    </span>;