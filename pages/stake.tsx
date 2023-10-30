import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";
import { useAuth } from "../context/AuthContext";
import { NFTABI, NFTAddress } from "../consts/abi/NFTInfo";
import { StakingABI, StakingAddress } from "../consts/abi/StakingInfo";
import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from "@biconomy/paymaster";


const Stake: NextPage = () => {
  const { provider, login, smartAccount, address } = useAuth();

  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const [minted, setMinted] = useState<boolean>(false)
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const { data: stakedTokens } = useContractRead(contract, "getStakeInfo", [
    address,
  ]);

  const [loadingWithdrawTxn, setLoadingWithdrawTxn] = useState(false);
  const [loadingStakeTxn, setLoadingStakeTxn] = useState(false);

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", [address]);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [[id]]);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }


  const approveNFTTx = async (tokenId: any) => {
    const contract = new ethers.Contract(
      NFTAddress,
      NFTABI,
      provider,
    )
    console.log("Contract", contract);

    const minTx = await contract.populateTransaction['approve'](
      StakingAddress,
      tokenId
    );
    console.log(minTx.data);
    const tx1 = {
      to: NFTAddress,
      data: minTx.data,
    };

    return tx1;
  }

  const stakeNFTTx = async (tokenId: any) => {
    const stakingContract = new ethers.Contract(
      StakingAddress,
      StakingABI,
      provider,
    )
    console.log("Contract", stakingContract);
    const minTx2 = await stakingContract.populateTransaction['stake'](
      [tokenId]
    );
    console.log(minTx2.data);
    const tx2 = {
      to: StakingAddress,
      data: minTx2.data,
    };
    return tx2;
  }



  const handleBundledTransaction = async (tokenId: any) => {
    setLoadingStakeTxn(true);
    console.log("Token Id", tokenId);
    const tx1 = await approveNFTTx(tokenId);
    const tx2 = await stakeNFTTx(tokenId);

    try {
      let userOp = await smartAccount.buildUserOp([tx1, tx2]);
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
      setLoadingStakeTxn(false);
      console.log("txHash", receipt.transactionHash);
    } catch (error) {
      console.log("Error", error);
      setLoadingStakeTxn(false);
    }
  }

  const handleClaimRewards = async () => {
    const stakingContract = new ethers.Contract(
      StakingAddress,
      StakingABI,
      provider,
    )
    console.log("Contract", stakingContract);
    const minTx1 = await stakingContract.populateTransaction.claimRewards();
    console.log(minTx1.data);
    const tx1 = {
      to: StakingAddress,
      data: minTx1.data,
    };

    try {
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
    } catch (error) {
      console.log("Error", error);
    }
  }

  const handleWithdrawNFT = async (tokenId: any) => {
    setLoadingWithdrawTxn(true);

    const stakingContract = new ethers.Contract(
      StakingAddress,
      StakingABI,
      provider,
    )
    console.log("Contract", stakingContract);
    const minTx1 = await stakingContract.populateTransaction.withdraw(
      [tokenId]
    );
    console.log(minTx1.data);
    const tx1 = {
      to: StakingAddress,
      data: minTx1.data,
    };

    try {
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
      setLoadingWithdrawTxn(false);
      console.log("txHash", receipt.transactionHash);
    } catch (error) {
      console.log("Error", error);
      setLoadingWithdrawTxn(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Stake Your NFTs</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <ConnectWallet />
      ) : (
        <>
          <h2>Your Tokens</h2>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>


          <button onClick={handleClaimRewards}>Claim Reward</button>

          {/* <Web3Button
            action={(contract) => contract.call("claimRewards")}
            contractAddress={stakingContractAddress}
          >
            Claim Rewards
          </Web3Button> */}

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Staked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => {
                return (
                  <NFTCard
                    tokenId={stakedToken.toNumber()}
                    key={stakedToken.toString()}
                    handleWithdrawNFT={handleWithdrawNFT}
                    loadingWithdrawTxn={loadingWithdrawTxn}

                  />
                )
              })}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Unstaked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => {

              return (
                <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                    className={styles.nftMedia}
                  />
                  <h3>{nft.metadata.name}</h3>

                  {
                    loadingStakeTxn ? (
                      <div> loading ...</div>
                    ) : (
                      <button className={styles.StakeBtn} onClick={() => {
                        handleBundledTransaction(nft.metadata.id)
                      }}>Stake NFT</button>

                    )
                  }


                  {/* <Web3Button
                    contractAddress={stakingContractAddress}
                    action={() => stakeNft(nft.metadata.id)}
                  >
                    Stake
                  </Web3Button> */}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Stake;
