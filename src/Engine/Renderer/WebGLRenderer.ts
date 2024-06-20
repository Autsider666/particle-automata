import * as twgl from "twgl.js";
import {DecodedBuffer} from "../../Utility/BufferBackedObject.ts";
import {RGBATuple} from "../../Utility/Color.ts";
import {PixelDataHelper} from "../../Utility/Rendering/PixelDataHelper.ts";
import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
import {ParticleSchema} from "../Schema/ParticleSchema.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {BaseRenderer, RendererProps} from "./BaseRenderer.ts";
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

export class WebGLRenderer extends BaseRenderer {
    private pixels: PixelDataHelper;
    private texture!: WebGLTexture;
    private programInfo!: twgl.ProgramInfo;
    private bufferInfo!: twgl.BufferInfo;

    private frame: number = 0;

    private readonly gl: WebGLRenderingContext;
    private readonly colorMode: number;
    private readonly backgroundColor: RGBATuple = ParticleType.Air.colorTuple ?? [0, 0, 0, 1];

    constructor(props: RendererProps, useAlpha: boolean = false) {
        super(props);
        const {config, canvas} = props;

        this.pixels = new PixelDataHelper(
            config.viewport,
            this.particleSize,
            useAlpha
        );

        const glContext = canvas.getContext('webgl', {
            alpha: useAlpha,
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

        this.colorMode = useAlpha ? this.gl.RGBA : this.gl.RGB;
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.clearColor(...this.backgroundColor);

        this.resize(config.viewport);
    }

    resize(dimensions: ViewportDimensions): void {
        super.resize(dimensions);
        this.pixels.resize(dimensions, this.backgroundColor);

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

    protected draw({particles, dirtyParticles, chunks, dirtyChunks}: RendererWorld): void {
        for (const dirtyParticle of dirtyParticles) {
            this.handleParticle(particles[dirtyParticle]);
        }

        if (this.firstDraw) {
            for (const chunk of chunks) {
                for (const particle of chunk.particles) {
                    this.handleParticle(particle);
                }
            }
        } else {
            if (dirtyChunks.length === 0) {
                return;
            }

            for (const index of dirtyChunks) {
                for (const particle of chunks[index].particles) {
                    this.handleParticle(particle);
                }
            }
        }


        // Update texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texSubImage2D(
            this.gl.TEXTURE_2D, 0, 0, 0, this.width, this.height,
            this.colorMode, this.gl.UNSIGNED_BYTE, this.pixels.pixelData
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
            internalFormat: this.colorMode,
            format: this.colorMode,
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

    private handleParticle(particle: DecodedBuffer<typeof ParticleSchema>): void {
        const coordinate = particle.coordinate;
        this.pixels.fillRectangle(
            {x: coordinate.x, y: coordinate.y} as GridCoordinate,
            this.particleSize,
            this.particleSize,
            [
                particle.color.red,
                particle.color.green,
                particle.color.blue,
                particle.color.alpha,
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