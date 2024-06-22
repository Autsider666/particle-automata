import {createContext, JSX, useContext} from "solid-js";
import {InputEvent} from "../../Engine/UI/Event.ts";
import {EventHandlerInterface} from "../../Utility/Event/EventHandlerInterface.ts";


const EventHandlerContext = createContext<EventHandlerInterface<InputEvent>>();

type EventHandlerProviderProps = {
    eventHandler: EventHandlerInterface<InputEvent>,
    children: JSX.Element
}

export const EventHandlerProvider = (props: EventHandlerProviderProps) =>
    <EventHandlerContext.Provider value={props.eventHandler}>{props.children}</EventHandlerContext.Provider>;

export const useEventHandler = () => useContext(EventHandlerContext)!;