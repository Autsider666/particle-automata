import * as twgl from "twgl.js";
import {RGBATuple} from "../../Utility/Color.ts";
import {PixelDataHelper} from "../../Utility/Rendering/PixelDataHelper.ts";
import {WorldDimensions} from "../../Utility/Type/Dimensional.ts";
import {Particle} from "../Particle/Particle.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {Renderer, RendererProps} from "./Renderer.ts";

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
        const {config,canvas} = props;
        this.pixels = new PixelDataHelper(
            config.world.outerBounds,
            this.particleSize,
        );

        const glContext = canvas.getContext('webgl',{
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

        this.resize(config.world.outerBounds);
    }

    resize(dimensions: WorldDimensions): void {
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

    draw(): void {
        if(this.firstDraw){
            this.world.iterateAllParticles(this.handleParticle.bind(this));
            this.firstDraw = false; // TODO generalize this away?
        } else {
            this.world.iterateActiveChunks(chunk =>
                chunk.iterateDirtyParticles(this.handleParticle.bind(this))
            );
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

    private handleParticle(particle: Particle, coordinate: WorldCoordinate): void {
        if (particle.ephemeral) {
            this.clearGridElement(coordinate);
        } else if (particle.colorTuple) {
            this.fillGridElement(coordinate, particle.colorTuple);
        }
    }

    private clearGridElement(coordinate: WorldCoordinate): void {
        this.pixels.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            [0, 0, 0, 255],
        );
    }

    private fillGridElement(coordinate: WorldCoordinate, color: RGBATuple) {
        this.pixels.fillRectangle(
            coordinate,
            this.particleSize,
            this.particleSize,
            color,
        );
    }
}