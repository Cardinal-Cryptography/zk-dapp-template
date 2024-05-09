import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { RsaChallenge__factory } from './types';
// @ts-ignore
import * as snarkjs from 'snarkjs';

const CONTRACT_ADDRESS
 = ''; // replace with your contract's address


const provider = new ethers.BrowserProvider((window as any).ethereum);

await (window as any).ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{ 
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org']
  }],
})

await (window as any).ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }],
});

function RsaChallengeComponent() {
  const [challengesCount, setChallengesCount] = useState(BigInt(0));
  const [challengesSolved, setChallengesSolved] = useState<boolean[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [challenges, setChallenges] = useState<BigInt[]>([]);

  useEffect(() => {
    async function fetchChallengesCount() {
      const signer = await provider.getSigner();
      const rsaChallengeContract = RsaChallenge__factory.connect(CONTRACT_ADDRESS
        , signer);
      const count = await rsaChallengeContract.challengesCount();
      setChallengesCount(count);

      // Fetch the challenges
      const challenges = [];
      const challengesSolved = [];
      for (let i = 0; i < count; i++) {
        const challenge = await rsaChallengeContract.challenges(i);
        const challengeSolved = await rsaChallengeContract.challengesCompleted(challenge);
        challenges.push(challenge);
        challengesSolved.push(challengeSolved !== ethers.ZeroAddress);
      }
      setChallenges(challenges);
      setChallengesSolved(challengesSolved);
    }

    fetchChallengesCount();
  }, [isLoading]);


  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const handleChallengeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChallenge(event.target.value);
  };

  const handleAChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setA(event.target.value);
  };

  const handleBChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setB(event.target.value);
  };

  // Set the default selected challenge as the first non-solved challenge
  useEffect(() => {
    const firstNonSolvedChallenge = challenges.find((challenge, index) => !challengesSolved[index]);
    if (firstNonSolvedChallenge) {
      setSelectedChallenge(firstNonSolvedChallenge.toString());
    }
  }, [challenges, challengesSolved]);

  const handleSubmit = async () => {
    // Execute function with challenge, a, b as inputs
    // Replace the following console.log with your actual function execution code
    setIsLoading(true);
    console.log(`Challenge: ${selectedChallenge}, a: ${a}, b: ${b}`);

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();
    const rsaChallengeContract = RsaChallenge__factory.connect(CONTRACT_ADDRESS
      , signer);
    
    const {proof} = await snarkjs.groth16.fullProve(
      {
        a,
        b
      },
      "rsa_challenge.wasm",
      "rsa_challenge_0001.zkey",
    );

    console.log('Sending proof');
    const tx = await rsaChallengeContract.solveChallenge(selectedChallenge, 
      [proof.pi_a[0], proof.pi_a[1], proof.pi_b[0][1], proof.pi_b[0][0], proof.pi_b[1][1], proof.pi_b[1][0], proof.pi_c[0], proof.pi_c[1]]
    );
    console.log(`Transaction ID: ${tx.hash}`);
    await tx.wait();
    console.log('waited enough');
    setIsLoading(false);
    
  };

  return (
    <div>
      <h1>RSA Challenge</h1>
      <p>Challenges count: {challengesCount.toString()}</p>
      <ul>
        {challenges.map((challenge, index) => (
          <li key={index} style={{ textDecoration: challengesSolved[index] ? 'line-through' : 'none' }}>
            {challenge.toString()}
          </li>
        ))}
      </ul>
      <div>
        <select value={selectedChallenge} onChange={handleChallengeChange}>
          {challenges.map((challenge, index) => (
            !challengesSolved[index] && <option key={index} value={challenge.toString()}>{challenge.toString()}</option>
          ))}
        </select>
        =
        <input type="number" placeholder="a" value={a} onChange={handleAChange} />
        *
        <input type="number" placeholder="b" value={b} onChange={handleBChange} />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}


export default RsaChallengeComponent;