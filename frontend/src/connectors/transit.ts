export async function detectTransitDelay(line: string) {
  const delay = Math.floor(Math.random() * 25);
  return {
    type: "transit",
    probability: delay > 10 ? 0.8 : 0.2,
    predictedDelay: delay,
    line,
  };
}