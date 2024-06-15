import {expect, test} from 'vitest';
import {ParticleType} from "../Particle/ParticleType.ts";
import {BoundingBox} from "../Utility/Excalibur/BoundingBox.ts";
import {Chunk} from './Chunk.ts';
import {WorldCoordinate} from "./World.ts";

const testBounds = BoundingBox.fromDimension(10, 5);

test('Can get particle', () => {
    const chunk = new Chunk(testBounds, testBounds.topLeft, () => ParticleType.Air);
    const coordinate = {x: 5, y: 1} as WorldCoordinate;

    expect(chunk.getParticle(coordinate).color).to.eq(ParticleType.Air.color);
});

test('Throws error on get with invalid coordinate', () => {
    const chunk = new Chunk(testBounds, testBounds.topLeft);

    expect(() => chunk.getParticle({x: -10, y: 1} as WorldCoordinate)).to.throw('Invalid coordinate');
    expect(() => chunk.getParticle({x: 10, y: 1} as WorldCoordinate)).to.throw('Invalid coordinate');
    expect(() => chunk.getParticle({x: -10, y: -1} as WorldCoordinate)).to.throw('Invalid coordinate');
});

test('Can set particle', () => {
    const chunk = new Chunk(testBounds, testBounds.topLeft);
    const coordinate = {x: 2, y: 1} as WorldCoordinate;

    expect(chunk.getParticle(coordinate)).to.not.eq(ParticleType.Air);
    expect(chunk.getParticle(coordinate).color).to.eq(ParticleType.Air.color);
    expect(() => chunk.setParticle(coordinate, ParticleType.Sand)).to.not.throw();
    expect(chunk.getParticle(coordinate)).to.not.eq(ParticleType.Sand);
    expect(chunk.getParticle(coordinate).color).to.not.eq(ParticleType.Sand.color);
    expect(chunk.getParticle(coordinate).density).to.eq(ParticleType.Sand.density);
});

test('Throws error on set with invalid coordinate', () => {
    const chunk = new Chunk(testBounds, testBounds.topLeft);
    const coordinate = {x: -10, y: 10} as WorldCoordinate;

    expect(() => chunk.setParticle(coordinate, ParticleType.Sand)).to.throw('Invalid coordinate');
});