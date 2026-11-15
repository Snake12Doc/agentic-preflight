import assert from "node:assert/strict";
import test from "node:test";
import { placeOrder } from "../src/application/place-order.js";

test("places an order with a normalized identifier", () => {
  assert.deepEqual(placeOrder("  order-123  "), { id: "order-123" });
});

test("rejects an order whose identifier is only whitespace", () => {
  assert.throws(() => placeOrder(" \t\n "), {
    name: "Error",
    message: "Order id must not be empty",
  });
});
