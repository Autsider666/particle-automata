import * as twgl from "twgl.js";
import {DecodedBuffer} from "../../Utility/BufferBackedObject.ts";
import {PixelDataHelper} from "../../Utility/Rendering/PixelDataHelper.ts";
import {GridDimensions, Traversal} from "../../Utility/Type/Dimensional.ts";
import {RenderParticleSchema} from "../Schema/RenderParticleSchema.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {Renderer, RendererProps} from "./Renderer.ts";
import {RendererWorld} from "./Type/RendererWorld.ts";

const vertexShader = `
    precision mediump float;
    attribute vec2 a_position;
    varying vec2 v_position;
    void main(){
        v_position = a_position;
        gl_Position = vec4(
            a_position.x * 2.0 - 1.0, v_position.y * -2.0 + 1.0, 0.0, 1.0
        );
    }
`;

const fragmentShader = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_position;
    void main(){
        gl_FragColor = texture2D(u_texture, v_position);
    }
`;

export class WebGLRenderer extends Renderer {
    private pixels: PixelDataHelper<WorldCoordinate>;
    private texture!: WebGLTexture;
    private programInfo!: twgl.ProgramInfo;
    private bufferInfo!: twgl.BufferInfo;

    private frame: number = 0;

    private readonly gl: WebGLRenderingContext;

    constructor(props: RendererProps) {
        super(props);
        const {config, canvas} = props;

        const gridDimensions = Traversal.getGridDimensions(config.initialScreenBounds,this.particleSize);
        this.pixels = new PixelDataHelper(
            gridDimensions,
            this.particleSize,
        );

        const glContext = canvas.getContext('webgl', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
        });
        if (!(glContext instanceof WebGLRenderingContext)) {
            throw new Error('Unable to get WebGL Context');
        }

        this.gl = glContext;
        twgl.setDefaults({
            textureColor: [0, 0, 0, 1],
            attribPrefix: "a_",
        });

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.clearColor(0, 0, 0, 1);

        this.resize(gridDimensions);
    }

    resize(dimensions: GridDimensions): void {
        super.resize(dimensions);
        this.pixels.resize(dimensions);

        this.texture = this.newTexture(this.gl, this.pixels.pixelData);
        this.programInfo = twgl.createProgramInfo(this.gl, [
            vertexShader, fragmentShader,
        ]);
        this.gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, {
            u_texture: this.texture,
        });

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            position: {
                numComponents: 2,
                data: [
                    0, 0,
                    0, 1,
                    1, 0,
                    1, 1,
                ],
            },
        });
    }

    draw(_world: RendererWorld, renderParticles: DecodedBuffer<typeof RenderParticleSchema>[]): void {
        if (this.firstDraw) {
            this.firstDraw = false; // TODO generalize this away?
        }

        const particleCount = renderParticles.length;
        for (let i = 0; i < particleCount; i++) {
            this.handleParticle(renderParticles[i]);
        }

        // Update texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texSubImage2D(
            this.gl.TEXTURE_2D, 0, 0, 0, this.width, this.height,
            this.gl.RGB, this.gl.UNSIGNED_BYTE, this.pixels.pixelData
        );
        // Render
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLE_STRIP);
        this.frame++;
    }

    private newTexture(gl: WebGLRenderingContext, pixels: Uint8Array): WebGLTexture {
        return twgl.createTexture(gl, {
            target: gl.TEXTURE_2D,
            width: this.width,
            height: this.height,
            minMag: gl.NEAREST,
            internalFormat: gl.RGB,
            format: gl.RGB,
            wrap: gl.CLAMP_TO_EDGE,
            src: pixels,
        });
    }

    // private handleParticle(coordinate: WorldCoordinate, particle: RendererParticle): void {
    //     if (particle.ephemeral) {
    //         this.clearGridElement(coordinate);
    //     } else {
    //         this.fillGridElement(coordinate, particle.color.tuple);
    //     }
    // }
    // private handleParticle(particle:DecodedBuffer<typeof RenderParticleSchema>): void {
    //     if (particle.ephemeral) {
    //         this.clearGridElement(coordinate);
    //     } else {
    //         this.fillGridElement(coordinate, particle.color.tuple);
    //     }
    // }

    private handleParticle(particle:DecodedBuffer<typeof RenderParticleSchema>): void {
        const coordinate = particle.coordinate;
        this.pixels.fillRectangle(
            {x:coordinate.x, y:coordinate.y} as WorldCoordinate,
            this.particleSize,
            this.particleSize,
            [
                particle.color.red,
                particle.color.green,
                particle.color.blue,
                0,
            ],
        );
    }

    // private clearGridElement(coordinate: WorldCoordinate): void {
    //     this.pixels.fillRectangle(
    //         coordinate,
    //         this.particleSize,
    //         this.particleSize,
    //         [0, 0, 0, 255],
    //     );
    // }
    //
    // private fillGridElement(coordinate: WorldCoordinate, color: RGBATuple) {
    //     this.pixels.fillRectangle(
    //         coordinate,
    //         this.particleSize,
    //         this.particleSize,
    //         color,
    //     );
    // }
}