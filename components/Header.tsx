import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Header: NextPage = () => {
  const router = useRouter();
  const { login , address} = useAuth();

  return (
    <div>
        <h2>Connect and Mint your AA powered NFT now</h2>
        {!address && <button className='border px-4 py-2' onClick={login}>Connect to Based Web3</button> }
        {address && <h2>Smart Account: {address}</h2>}
    </div>
  );
};

export default Header;
