// AuthContext.tsx

import React, { createContext, useContext, useState } from 'react';
import {
    ParticleAuthModule,
    ParticleProvider,
} from "@biconomy/particle-auth";
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ethers } from 'ethers'
import { ChainId } from "@biconomy/core-types";
import {
    IPaymaster,
    BiconomyPaymaster,
} from '@biconomy/paymaster'
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";
import {
    IHybridPaymaster,
    SponsorUserOperationDto,
    PaymasterMode
} from '@biconomy/paymaster'
import { BiconomySmartAccount } from "@biconomy/account";

// Create the context
const AuthContext = createContext<any>({});

// Create a provider component
export function AuthProvider({ children }: any) {
    const [particle, setParticle] = useState<ParticleAuthModule.ParticleNetwork | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [address, setAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false);
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Provider | null>(null)


    const bundler: IBundler = new Bundler({
        bundlerUrl: 'https://bundler.biconomy.io/api/v2/1442/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44', // bundler URL from dashboard use 84531 as chain id if you are following this on base goerli,    
        chainId: ChainId.POLYGON_ZKEVM_TESTNET,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    })

    const paymaster: IPaymaster = new BiconomyPaymaster({
        paymasterUrl: 'https://paymaster.biconomy.io/api/v1/1442/xZLcL2LFL.282332e9-309e-4745-a08b-e5bc43e27d97'
    });

    const initializeParticle = () => {
        // Initialize ParticleAuthModule
        const particleAuth = new ParticleAuthModule.ParticleNetwork({
            projectId: "90d826d1-6fd9-474c-8113-fc1c4029daf4",
            clientKey: "cGVd3pmBzTP5s4II30dU5foLD1YpletmaDMMpnvD",
            appId: "ac09bae3-9afd-42c1-8723-523d2b69a2fa",
            wallet: {
                displayWalletEntry: true,
                defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
            }
        });
        setParticle(particleAuth);
        return particleAuth
    };


    const login = async () => {
        const particles = initializeParticle();
        try {
            setLoading(true)
            const userInfo = await particles.auth.login();
            console.log("Logged in user:", userInfo);
            const particleProvider = new ParticleProvider(particles.auth);
            const web3Provider = new ethers.providers.Web3Provider(
                particleProvider,
                "any"
            );
            setProvider(web3Provider)

            const ECDSAModule = await ECDSAOwnershipValidationModule.create({
                signer: web3Provider.getSigner(),
                moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
            })

            let biconomySmartAccount = await BiconomySmartAccountV2.create({
                chainId: ChainId.POLYGON_ZKEVM_TESTNET,
                bundler: bundler,
                paymaster: paymaster,
                entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
                defaultValidationModule: ECDSAModule,
                activeValidationModule: ECDSAModule
            })
            setAddress(await biconomySmartAccount.getAccountAddress())
            setSmartAccount(biconomySmartAccount)
            console.log("Account and address", biconomySmartAccount, await biconomySmartAccount.getAccountAddress());
            setLoading(false)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ loggedIn, login, initializeParticle, provider, smartAccount, address }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for using the context
export function useAuth() {
    return useContext(AuthContext);
}
