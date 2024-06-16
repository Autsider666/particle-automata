import {expect, test} from "vitest";
import {World} from "./World.ts";

//TODO add outer bounds test
// const testBounds = BoundingBox.fromDimension(10, 10);

test('Generates chunks on init', () => {
    expect((new World(10)).totalChunks).to.equal(1);
    expect((new World(5)).totalChunks).to.equal(4);
    expect((new World(2)).totalChunks).to.equal(25);
    expect((new World(1)).totalChunks).to.equal(100);
});