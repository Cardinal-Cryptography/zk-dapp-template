import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: 'https://rpc.ankr.com/eth_sepolia',
      accounts: [''], //put your deployment private key here
    }
  }
};

export default config;
