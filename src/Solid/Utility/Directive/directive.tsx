import {Accessor} from "solid-js";

type Directive<P = true> = (el: Element, props: Accessor<P>) => void;

export const useDirective = <T,>(directive: Directive<T>, accessor: T) => (ref:Element) => directive(ref, () => accessor);