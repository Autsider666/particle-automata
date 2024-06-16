import {expect, test} from "vitest";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {World} from "./World.ts";

const testBounds = BoundingBox.fromDimension(10, 10);

test('Generates chunks on init', () => {
    expect((new World(testBounds, 10)).totalChunks).to.equal(1);
    expect((new World(testBounds, 5)).totalChunks).to.equal(4);
    expect((new World(testBounds, 2)).totalChunks).to.equal(25);
    expect((new World(testBounds, 1)).totalChunks).to.equal(100);
});