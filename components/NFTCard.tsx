import {
  ThirdwebNftMedia,
  useContract,
  useNFT,
  Web3Button,
} from "@thirdweb-dev/react";
import type { FC } from "react";
import {
  nftDropContractAddress,
  stakingContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

interface NFTCardProps {
  tokenId: number;
  handleWithdrawNFT: any;
  loadingWithdrawTxn: boolean
}

const NFTCard: FC<NFTCardProps> = ({ tokenId, handleWithdrawNFT, loadingWithdrawTxn }) => {
  const { contract } = useContract(nftDropContractAddress, "nft-drop");
  const { data: nft } = useNFT(contract, tokenId);


  return (
    <>
      {nft && (
        <div className={styles.nftBox}>
          {nft.metadata && (
            <ThirdwebNftMedia
              metadata={nft.metadata}
              className={styles.nftMedia}
            />
          )}
          <h3>{nft.metadata.name}</h3>

          {loadingWithdrawTxn ? (
            <div>Loading....</div>
          ) : (
            <button onClick={() => {
              handleWithdrawNFT(nft.metadata.id);
            }}>Withdraw</button>
          )}

        </div>
      )}
    </>
  );
};
export default NFTCard;
