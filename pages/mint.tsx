import { Web3Button, useAddress } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { nftDropContractAddress } from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";
import { useContract , useContractWrite} from "@thirdweb-dev/react";

const Mint: NextPage = () => {
  const address = useAddress();
  const router = useRouter();
  const { contract } = useContract("0x8D31a6747FaEbFA795770D4F37e5655c8D3643fe");
  const { mutateAsync: claim, isLoading } = useContractWrite(contract, "claim");
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Mint An NFT!</h1>

      <p className={styles.explain}>
        Allow users to mint one of the NFTs from the collection that we lazy minted.
      </p>
      <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />

      <Web3Button
        theme="dark"
        contractAddress={nftDropContractAddress}
        action={(contract) => contract.erc721.claim(1)}
        onSuccess={() => {
          alert("NFT Claimed!");
          router.push("/stake");
        }}
        onError={(error) => {
          alert(error);
        }}
      >
        Claim An NFT
      </Web3Button>

    
      <Web3Button
      contractAddress="0x8D31a6747FaEbFA795770D4F37e5655c8D3643fe"
      action={(contract) => {
        contract.call("claim", [address, 1 , "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" , 0, [], []])
      }}
    >
      claim
    </Web3Button>
    </div>
  );
};

export default Mint;
