import {InputEvent} from "../Engine/UI/Event.ts";
import {EventHandlerInterface} from "../Utility/Event/EventHandlerInterface.ts";
import {EventHandlerProvider} from "./Context/EventHandlerContext.tsx";
import {ElementMenu} from "./Menu/ElementMenu.tsx";
import {MenuNavBar} from "./Menu/MenuNavBar.tsx";
import {ToolSelector} from "./ToolSelector.tsx";
import {ShortcutManager} from "./Utility/ShortcutManager.tsx";

type UIProps = {
    eventHandler: EventHandlerInterface<InputEvent>,
}

export const UI = ({eventHandler}: UIProps) => {
    return <EventHandlerProvider eventHandler={eventHandler}>
        <MenuNavBar
            left={[<ElementMenu alignRight={false}/>]}
            center={[<ToolSelector/>]}
        />
        <ShortcutManager/>
    </EventHandlerProvider>;
};