// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./Groth16Verifier.sol";

contract RsaChallenge {
    address payable public owner;
    Groth16Verifier private verifier;

    mapping(uint256 => uint256) public challenges;
    mapping(uint256 => uint256) private challengesSet;
    mapping(uint256 => address) public challengesCompleted;

    uint256 public challengesCount;

    event Verified(address user, uint256 challenge);

    constructor(address snarkVerifier) payable {
        verifier = Groth16Verifier(snarkVerifier);
        owner = payable(msg.sender);
        challengesCount = 0;
    }

    function newChallenge(uint256 challenge) public {
        require(msg.sender == owner, "You aren't the owner");
        require(challengesSet[challenge] == 0, "Challenge already exists");
        challengesSet[challenge] = 1;
        challenges[challengesCount] = challenge;
        challengesCount++;
    }

    function solveChallenge(uint256 challenge, uint256[8] memory proof) public {
        require(challengesSet[challenge] == 1, "Challenge does not exist");
        require(challengesCompleted[challenge] == address(0), "Challenge already solved");

        uint256[2] memory pA = [proof[0], proof[1]];
        uint256[2][2] memory pB = [[proof[2], proof[3]], [proof[4], proof[5]]];
        uint256[2] memory pC = [proof[6], proof[7]];

        require(verifier.verifyProof(pA, pB, pC, [challenge]), "Invalid proof");

        challengesCompleted[challenge] = msg.sender;
        emit Verified(msg.sender, challenge);
    }

}
