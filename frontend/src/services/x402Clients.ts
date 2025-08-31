// src/services/x402Client.ts
import axios from "axios";
import { ethers } from "ethers";

const FACILITATOR = "https://x402-coinbase.vercel.app";
const PRICE = ethers.parseUnits("0.001", 6); // 0.001 USDC

export const delayFeed = axios.create({
  baseURL: FACILITATOR,
  headers: {
    "X-PAYMENT": PRICE.toString(), // simple header until SDK stabilises
  },
});