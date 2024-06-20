import './style.css';
import '@snackbar/core/dist/snackbar.css';
import {EngineConfigBuilder} from "./Engine/Config/EngineConfig.ts";
import {Engine} from "./Engine/Engine.ts";

const rootElement = document.querySelector<HTMLDivElement>('#renderer');
if (!rootElement) {
    throw new Error('Could not find root element');
}

const config = EngineConfigBuilder.generate();

const engine = new Engine(rootElement, config);

await engine.init();

document.body.addEventListener('keypress', async ({code}) => {
    if (code !== 'Space') {
        return;
    }

    if (await engine.isRunning()) {
        engine.stop();
    } else {
        engine.start();
    }
});

// window.addEventListener('resize', () => engine.resize(Traversal.getViewportDimensions(
//     {
//         width: URLParams.get('width', "number") ?? window.innerWidth,
//         height: URLParams.get('height', "number") ?? window.innerHeight,
//     },
//     config.renderer.particleSize,
// )));


