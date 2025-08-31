export async function detectAmazonDelay(order: string) {
  // mock: 70 % chance of 30-min delay
  const delay = Math.random() < 0.7 ? 30 : 0;
  return {
    type: "delivery",
    probability: delay > 0 ? 0.7 : 0.3,
    predictedDelay: delay,
    order,
  };
}