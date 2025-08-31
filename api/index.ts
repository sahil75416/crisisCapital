import axios from "axios";
import { ethers } from "ethers";
import CrisisDEXArtifact from "../frontend/src/abi/CrisisDEX.json";

const AVIATION_URL = "https://api.aviationstack.com/v1/flights";
const CONTRACT = "0xYourDeployedAddress";

export async function createFlightMarket(flightIata: string) {
  const { data } = await axios.get(AVIATION_URL, {
    params: { access_key: process.env.AVIATIONSTACK_KEY, flight_iata: flightIata, limit: 1 },
  });
  const delay = data.data[0]?.arrival?.delay ?? 0;
  if (delay <= 0) return;

  const description = `Flight ${flightIata} delay >${delay}min`;
  const future = Math.floor(Date.now() / 1000) + 86400;
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  const dex = new ethers.Contract(CONTRACT, CrisisDEXArtifact.abi, signer);
  await dex.approve(await dex.getAddress(), ethers.parseEther("100"));
  await dex.createMarket(description, future);
}