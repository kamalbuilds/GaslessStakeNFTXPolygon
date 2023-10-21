import { ThirdwebProvider } from "@thirdweb-dev/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { PolygonZkevmTestnet } from "@thirdweb-dev/chains";
import Header from "../components/Header";

const activeChain = "mumbai";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      activeChain={PolygonZkevmTestnet}
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
      sdkOptions={{
        gasless: {
          biconomy: {
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
            apiId: "79322761-6bc8-4af5-8dfc-70521eb7922a",
          }
        },
      }}
    >
      <AuthProvider>
        <Header />
        <Component {...pageProps} />
      </AuthProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
