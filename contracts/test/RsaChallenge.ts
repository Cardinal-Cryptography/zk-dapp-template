import { expect } from "chai";
import hre from "hardhat";
// @ts-ignore
import * as snarkjs from "snarkjs";

describe("RsaChallenge", function () {
  this.beforeEach(async function () {
    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    const RsaChallenge = await hre.ethers.getContractFactory("RsaChallenge");
    const rsaChallenge = await RsaChallenge.deploy(await verifier.getAddress());
    this.rsaChallenge = rsaChallenge;
  });
  it("should create a challenge", async function () {

    await this.rsaChallenge.newChallenge(33);
    
    const challengesCount = await this.rsaChallenge.challengesCount();
    expect(challengesCount).to.be.equal(1);
    const firstChallenge = await this.rsaChallenge.challenges(0);
    expect(firstChallenge).to.be.equal(33);
  });
  it("should solve a challenge", async function () {

    await this.rsaChallenge.newChallenge(33);
  
    const {proof} = await snarkjs.groth16.fullProve(
      {
        a: "3",
        b: "11",
      },
      "../circuits/rsa_challenge_js/rsa_challenge.wasm",
      "../circuits/setup/rsa_challenge_0001.zkey",
    );

    await this.rsaChallenge.solveChallenge(33, 
      [proof.pi_a[0], proof.pi_a[1], proof.pi_b[0][1], proof.pi_b[0][0], proof.pi_b[1][1], proof.pi_b[1][0], proof.pi_c[0], proof.pi_c[1]]
    );
    
    // check event is emitted
    const result = await this.rsaChallenge.queryFilter("Verified");
    expect(result.length).to.be.equal(1);
    expect(result[0].args[0]).to.be.equal(await (await hre.ethers.provider.getSigner()).getAddress());
    expect(result[0].args[1]).to.be.equal(33);

    // check challenge is completed
    const address = await this.rsaChallenge.challengesCompleted(33);
    expect(address).to.be.equal(await (await hre.ethers.provider.getSigner()).getAddress());
    
  });
});