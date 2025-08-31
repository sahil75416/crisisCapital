import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CrisisDEXArtifact from "../abi/CrisisDEX.json";

// Contract deployed on Base Sepolia - Updated with testnet address
const CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8d49D1dFA1aCdE9fE"; // Base Sepolia testnet address

export function useCrisisDEX(provider: ethers.BrowserProvider | null) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) {
      setContract(null);
      setError(null);
      return;
    }
    
    const initContract = async () => {
      try {
        console.log('🔗 Initializing CrisisDEX contract...');
        const signer = await provider.getSigner();
        const ctr = new ethers.Contract(
          CONTRACT_ADDRESS,
          CrisisDEXArtifact.abi,
          signer
        );
        
        // Test contract connection
        await ctr.getAddress();
        console.log('✅ Contract connected:', CONTRACT_ADDRESS);
        
        setContract(ctr);
        setError(null);
      } catch (err) {
        console.error('❌ Contract initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Contract connection failed');
        setContract(null);
      }
    };

    initContract();
  }, [provider]);

  return { contract, error };
}