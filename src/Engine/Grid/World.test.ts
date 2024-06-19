import {expect, test} from "vitest";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {WorldCoordinate} from "../Type/Coordinate.ts";
import {World} from "./World.ts";

const testBounds = BoundingBox.fromDimension<WorldCoordinate>(10, 10);

test('Generates chunks on init', () => {
    expect((new World(10, testBounds)).totalChunks).to.equal(1);
    expect((new World(5, testBounds)).totalChunks).to.equal(4);
    expect((new World(2, testBounds)).totalChunks).to.equal(25);
    expect((new World(1, testBounds)).totalChunks).to.equal(100);
});