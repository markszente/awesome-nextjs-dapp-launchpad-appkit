import { AppKitNetwork, defineChain, hardhat, polygon, polygonAmoy } from "@reown/appkit/networks";

const supportedNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [hardhat, polygonAmoy, polygon];

export default supportedNetworks