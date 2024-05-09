# Zero-knowledge dApp example in Aleph Zero

## Components

- `/circuits` circuit written in circom language
- `/contracts` Solidity smart contract for on-chain circuit verification
- `/frontend` React frontend, submitting zero-knowledge proofs to smart contract

## Usage

1. Run `npm install`.
2. Put private key for deployment account in `contracts/hardhat.config.ts`
3. From root directory, execute `npm run deploy` to deploy smart contracts on-chain. You will get contract address.
4. Put contract address in `frontend/src/RsaChallengeComponent.tsx`. Execute `npm run start`.