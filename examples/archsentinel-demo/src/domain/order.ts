export interface Order {
  readonly id: string;
}

export function createOrder(id: string): Order {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error("Order id must not be empty");
  }
  return { id: normalizedId };
}
