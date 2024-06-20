import {expect, test} from "vitest";
import {BoundingBox} from "../../Utility/Excalibur/BoundingBox.ts";
import {EventHandler} from "../../Utility/Excalibur/EventHandler.ts";
import {GridCoordinate} from "../Type/Coordinate.ts";
import {WorldEvent} from "../World/WorldBuilder.ts";
import {World} from "./World.ts";

const testBounds = BoundingBox.fromDimension<GridCoordinate>(10, 10);
const testEvents = new EventHandler<WorldEvent>();

test('Generates chunks on init', () => {
    expect((new World(10, testBounds, testEvents)).totalChunks).to.equal(1);
    expect((new World(5, testBounds, testEvents)).totalChunks).to.equal(4);
    expect((new World(2, testBounds, testEvents)).totalChunks).to.equal(25);
    expect((new World(1, testBounds, testEvents)).totalChunks).to.equal(100);
});