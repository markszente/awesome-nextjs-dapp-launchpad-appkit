import supportedNetworks from "@/config/networks";
import { AppKitNetwork, hardhat } from "@reown/appkit/networks";
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider, useAppKitState, useDisconnect } from "@reown/appkit/react";
import { Eip1193Provider } from "ethers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

/**
 * @description Useful methods and data about Wallet
 */
export const useWallet = () => {
    const { open: showConnectDialog, close: closeConnectDialog } = useAppKit();
    const { open: isConnectDialogOpen } = useAppKitState();
    const { address: walletAddress, status: walletConnectionStatus } = useAppKitAccount();
    const { disconnect: disconnectWallet } = useDisconnect();
    const { caipNetwork: chainCurrent, switchNetwork: appkitSwitchNetwork } = useAppKitNetwork();
    
    // Helper function to convert chain ID to AppKit network format
    const switchNetwork = (chainId: number) => {
        const network = [...supportedNetworks].find((network: AppKitNetwork) => network.id === chainId);
        appkitSwitchNetwork(network!);
    };

    // Get provider using the chain namespace (default to 'eip155' for EVM chains)
    const { walletProvider } = useAppKitProvider<Eip1193Provider>(
        chainCurrent?.chainNamespace || 'eip155'
    );

    // Keep Ethers provider and signer updated for Wallet
    const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | null>(null);
    const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | null>(null);

    useEffect(() => {
        if (walletProvider && walletConnectionStatus === "connected") {
            (async () => {
                try {
                    const ethersProviderNew = new ethers.BrowserProvider(walletProvider);
                    const ethersSignerNew = await ethersProviderNew.getSigner();

                    setEthersProvider(ethersProviderNew);
                    setEthersSigner(ethersSignerNew);
                } catch (error) {
                    console.error("Error setting up ethers provider/signer:", error);
                    setEthersProvider(null);
                    setEthersSigner(null);
                }
            })();
        } else {
            setEthersProvider(null);
            setEthersSigner(null);
        }
    }, [walletProvider, walletConnectionStatus, walletAddress]);

    return {
        // Data
        isConnectDialogOpen,
        walletAddress,
        walletConnectionStatus: ((walletConnectionStatus === "connected") ? (ethersSigner ? "connected" : "connecting") : walletConnectionStatus) as ("disconnected" | "connected" | "reconnecting" | "connecting"),
        ethersProvider,
        chainCurrent,
        ethersSigner,

        // Methods
        showConnectDialog,
        closeConnectDialog,
        disconnectWallet,
        switchNetwork
    }
};