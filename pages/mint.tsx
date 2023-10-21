import { Web3Button, useAddress } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { nftDropContractAddress } from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";
import { useContract , useContractWrite} from "@thirdweb-dev/react";
import React from 'react';
import { useState } from 'react';
import { ethers } from 'ethers'
import NFTAbi from "../utils/NFTAbi.json";
import stakeABI from "../utils/stakeABI.json";
import {
    IHybridPaymaster,
    SponsorUserOperationDto,
    PaymasterMode
} from '@biconomy/paymaster'
import { useAuth } from "../context/AuthContext";

const Mint: NextPage = () => {
  const router = useRouter();
  const { contract } = useContract("0x8D31a6747FaEbFA795770D4F37e5655c8D3643fe");
  const { mutateAsync: claim, isLoading } = useContractWrite(contract, "claim");
  const [loading, setLoading] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false)
  const { provider , login , smartAccount , address} = useAuth();

  console.log(provider , smartAccount);

  const ThirdwebMint = async () => {
    console.log("Provider and smart account", provider, smartAccount);
    if (provider && smartAccount) {
        const nftAddress = "0x8D31a6747FaEbFA795770D4F37e5655c8D3643fe";
        const contract = new ethers.Contract(
            nftAddress,
            NFTAbi,
            provider,
        )
        console.log("Contract", contract);
        try {

            const receiver = address;
            const quantity = 1;
            const currency = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
            const pricePerToken = 0;
            const allowProof = {
                "proof": [],
                "quantityLimitPerWallet": "0",
                "pricePerToken": "0",
                "currency": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            }
            const data: never[] = [];


            const minTx = await contract.populateTransaction['claim'](
                receiver,
                quantity,
                currency,
                pricePerToken,
                allowProof,
                data
            )
            console.log(minTx.data);
            const tx1 = {
                to: nftAddress,
                data: minTx.data,
            };
            let userOp = await smartAccount.buildUserOp([tx1]);
            console.log({ userOp })
            const biconomyPaymaster =
                smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
            let paymasterServiceData: SponsorUserOperationDto = {
                mode: PaymasterMode.SPONSORED,
                smartAccountInfo: {
                    name: 'BICONOMY',
                    version: '2.0.0'
                },
            };
            const paymasterAndDataResponse =
                await biconomyPaymaster.getPaymasterAndData(
                    userOp,
                    paymasterServiceData
                );

            userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
            const userOpResponse = await smartAccount.sendUserOp(userOp);
            console.log("userOpHash", userOpResponse);
            const { receipt } = await userOpResponse.wait(1);
            setMinted(true)
            console.log("txHash", receipt.transactionHash);
        } catch (err: any) {
            console.error(err);
            console.log(err)
        }
    }
}
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Mint An NFT!</h1>

      <p className={styles.explain}>
        Allow users to mint one of the NFTs from the collection that we lazy minted.
      </p>
      <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />

    
      <button className='border border-gray-400 px-4 py-2 m-4' onClick={ThirdwebMint}> Claim an NFT</button>
    </div>
  );
};

export default Mint;
