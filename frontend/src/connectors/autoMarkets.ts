import { ethers } from "ethers";
import { detectAmazonDelay } from "./delivery";
import { detectTransitDelay } from "./transit";
import { detectFlightDelay } from "./flight";
import CrisisDEXArtifact from "../abi/CrisisDEX.json";

const CONTRACT_ADDRESS = "0x...YourDeployedAddress";

export async function startAutoMarkets(provider: ethers.BrowserProvider) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CrisisDEXArtifact.abi, signer);

  const create = async (desc: string) => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    const fee = ethers.parseEther("100");
    await contract.approve(await contract.getAddress(), fee);
    await contract.createMarket(desc, future);
  };

  // every 15 min
  setInterval(async () => {
    const d = await detectAmazonDelay("TEST123");
    if (d.predictedDelay > 0) await create(`Amazon delay >${d.predictedDelay}min`);
  }, 15 * 60 * 1000);
}