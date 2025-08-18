// src/hooks/useJoinedChamas.js
import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits, getAddress } from "ethers";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ChamaFactoryABI, contractAddress } from '../contracts/ChamaFactoryConfig';




const useJoinedChamas = () => {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [joinedChamas, setJoinedChamas] = useState([]);

  useEffect(() => {
    if (!isConnected || !address || !walletProvider) return;

    const fetchJoinedChamas = async () => {
      try {
        const provider = new BrowserProvider(walletProvider);
        const contract = new Contract(contractAddress, ChamaFactoryABI, provider);
        const chamaCountBN = await contract.chamaCount();
        const chamaCount = Number(chamaCountBN);
        console.log("[DEBUG] Total Chamas:", chamaCount);
        const normalizedAddress = getAddress(address);
        const joined = [];

        // Iterate over all chamas (assuming IDs start at 1)
        for (let i = 1; i <= chamaCount; i++) {
          const memberStatus = await contract.isMember(i, normalizedAddress);
          console.log(`[DEBUG] Chama ${i} membership for ${normalizedAddress}:`, memberStatus);
          if (memberStatus) {
            const chamaData = await contract.chamas(i);
            // Retrieve deposit held by the user in this Chama
            const depositHeldBN = await contract.memberDeposit(i, normalizedAddress);
            const depositHeld = formatUnits(depositHeldBN, 18);
            joined.push({
              id: Number(chamaData.id),
              creator: chamaData.creator,
              name: chamaData.name,
              description: chamaData.description,
              depositAmount: formatUnits(chamaData.depositAmount, 18),
              contributionAmount: formatUnits(chamaData.contributionAmount, 18),
              penalty: chamaData.penalty.toString(),
              maxMembers: chamaData.maxMembers.toString(),
              membersCount: chamaData.membersCount.toString(),
              cycleDuration: chamaData.cycleDuration.toString(),
              currentRound: chamaData.currentRound.toString(),
              currentCycle: chamaData.currentCycle.toString(),
              nextCycleStart: chamaData.nextCycleStart.toString(),
              isActive: chamaData.isActive,
              members: chamaData.members,
              depositHeld, // User's held deposit in this Chama
            });
          }
        }
        setJoinedChamas(joined);
      } catch (error) {
        console.error("Error fetching joined chamas:", error);
      }
    };

    fetchJoinedChamas();
  }, [isConnected, address, walletProvider]);

  return joinedChamas;
};

export default useJoinedChamas;
