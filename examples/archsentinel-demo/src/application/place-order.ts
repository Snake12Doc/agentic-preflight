import { createOrder, type Order } from "../domain/order.js";

export function placeOrder(id: string): Order {
  return createOrder(id);
}
