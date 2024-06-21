import {expect, test} from 'vitest';
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {ParticleBuilder, ParticleElement} from "../Particle/Particle.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {Chunk} from './Chunk.ts';

const testBounds = BoundingBox.fromDimension(10, 5);

test('Can get particle', () => {
    const chunk = new Chunk(testBounds, () => ParticleBuilder('Air'));
    const coordinate = {x: 5, y: 1} as GridCoordinate;

    expect(chunk.getParticle(coordinate).element.color).to.eq(ParticleElement.Air.color);
});

test('Throws error on get with invalid coordinate', () => {
    const chunk = new Chunk(testBounds);

    expect(() => chunk.getParticle({x: -10, y: 1} as GridCoordinate)).to.throw('Invalid coordinate');
    expect(() => chunk.getParticle({x: 10, y: 1} as GridCoordinate)).to.throw('Invalid coordinate');
    expect(() => chunk.getParticle({x: -10, y: -1} as GridCoordinate)).to.throw('Invalid coordinate');
});

test('Can set particle', () => {
    const chunk = new Chunk(testBounds);
    const coordinate = {x: 2, y: 1} as GridCoordinate;

    expect(chunk.getParticle(coordinate).element).to.not.eq(ParticleElement.Air);
    expect(chunk.getParticle(coordinate).element.color).to.eq(ParticleElement.Air.color);
    expect(() => chunk.createNewParticle(coordinate, "Sand")).to.not.throw();
    expect(chunk.getParticle(coordinate)).to.not.eq(ParticleElement.Sand);
    expect(chunk.getParticle(coordinate).element.color).to.not.eq(ParticleElement.Sand.color);
    expect(chunk.getParticle(coordinate).element.color).to.eq(ParticleElement.Sand.density);
});

test('Throws error on set with invalid coordinate', () => {
    const chunk = new Chunk(testBounds);
    const coordinate = {x: -10, y: 10} as GridCoordinate;

    expect(() => chunk.createNewParticle(coordinate, "Sand")).to.throw('Invalid coordinate');
});