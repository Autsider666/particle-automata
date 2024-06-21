import * as twgl from "twgl.js";
import {RGBATuple} from "../../Utility/Color.ts";
import {PixelDataHelper} from "../../Utility/Rendering/PixelDataHelper.ts";
import {ViewportDimensions} from "../../Utility/Type/Dimensional.ts";
import {World} from "../Grid/World.ts";
import {Particle} from "../Particle/Particle.ts";
import {ParticleType} from "../Particle/ParticleType.ts";
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

export class RealWorldWebGLRenderer extends BaseRenderer {
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

    protected draw(_: RendererWorld, realWorld?: World): void {
        if (this.firstDraw) {
            realWorld?.iterateAllParticles(this.handleRealParticle.bind(this));
        } else {
            realWorld?.iterateDirtyChunks(chunk => {
                chunk.iterateDirtyParticles(this.handleRealParticle.bind(this));
            });
        }

        this.gl.texSubImage2D(
            this.gl.TEXTURE_2D, 0, 0, 0, this.width, this.height,
            this.colorMode, this.gl.UNSIGNED_BYTE, this.pixels.pixelData
        );
        twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLE_STRIP);
        this.frame++;
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

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
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

    private handleRealParticle(particle: Particle, coordinate: GridCoordinate): void {
        this.pixels.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            particle.colorTuple,
        );
    }
}