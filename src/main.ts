import './style.css';
import '@snackbar/core/dist/snackbar.css';
import {Color, Engine} from "excalibur";
import {EngineConfigBuilder} from "./Engine/Config/EngineConfig.ts";
import {SimulationEngine} from "./Engine/SimulationEngine.ts";
import {InputManager} from "./Excalibur/InputManager.ts";
import {URLParams} from "./Utility/URLParams.ts";

const rootElement = document.querySelector<HTMLDivElement>('#renderer');
if (!rootElement) {
    throw new Error('Could not find root element');
}

const config = EngineConfigBuilder.generate();

const simulationEngine = new SimulationEngine(rootElement, config);

await simulationEngine.init();

const canvas = document.createElement('canvas');

rootElement.appendChild(canvas);

const excalibur = new Engine({
    width: config.renderer.viewport.width,
    height: config.renderer.viewport.height,
    canvasElement: canvas,
    enableCanvasTransparency: true,
    backgroundColor: Color.Transparent,
});

excalibur.add(new InputManager(
    simulationEngine,
    config.defaultParticle,
    config.renderer.particleSize,
    URLParams.get('drawRadius', 'number') ?? undefined
));

await excalibur.start();


