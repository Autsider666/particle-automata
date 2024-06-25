import './style.scss';
import {Color as EXColor, Engine as EXEngine} from "excalibur";
import {render} from "solid-js/web";
import {EngineConfigBuilder} from "./Engine/Config/EngineConfig.ts";
import {Engine} from "./Engine/Engine.ts";
import {InputManager} from "./Excalibur/InputManager.ts";
import {UI} from "./Solid/UI.tsx";

const rootElement = document.querySelector<HTMLDivElement>('#renderer');
if (!rootElement) {
    throw new Error('Could not find root element');
}

const config = EngineConfigBuilder.generate();

const engine = new Engine(rootElement, config);

await engine.init();

// new UIManager(engine,rootElement,config.ui);

const canvas = document.createElement('canvas');

rootElement.appendChild(canvas);

const excalibur = new EXEngine({
    width: config.renderer.viewport.width,
    height: config.renderer.viewport.height,
    canvasElement: canvas,
    enableCanvasTransparency: true,
    backgroundColor: EXColor.Transparent,
});

excalibur.add(new InputManager(
    engine,
    config.renderer.particleSize,
));

await excalibur.start();

// const stats = config.ui.ShowStats.value ? new Stats({
//     width: 100,
//     height: 60,
//     showAll: true,
//     defaultPanels: {
//         MS: {
//             decimals: 1,
//             maxValue: 25,
//         },
//     }
// }) : undefined;
//
// if (stats) {
//     stats.dom.classList.add('align-bottom-right');
//     document.body.appendChild(stats.dom);
//
//     engine.on('preUpdate', () => stats.begin());
//     engine.on('postUpdate', () => stats.end());
// }


render(() => <UI eventHandler={engine}/>, rootElement);