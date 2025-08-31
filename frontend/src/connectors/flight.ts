export async function detectFlightDelay(flight: string) {
  const delay = Math.floor(Math.random() * 120); // 0-120 min
  return {
    type: "flight",
    probability: delay > 30 ? 0.6 : 0.4,
    predictedDelay: delay,
    flight,
  };
}