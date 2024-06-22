import {ParticleElement} from "../Engine/Particle/Particle.ts";
import {InputEvent} from "../Engine/UI/Event.ts";
import {EventHandlerInterface} from "../Utility/Event/EventHandlerInterface.ts";
import {EventHandlerProvider} from "./Context/EventHandlerContext.tsx";
import {ElementMenu} from "./Menu/ElementMenu.tsx";

export const UI = ({eventHandler}: { eventHandler: EventHandlerInterface<InputEvent> }) => {
    return <EventHandlerProvider eventHandler={eventHandler}>
        <ElementMenu startingElement={ParticleElement.Sand.type}/>
    </EventHandlerProvider>;
};