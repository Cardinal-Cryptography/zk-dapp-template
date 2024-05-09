import hre from "hardhat";

async function main() {
  const accounts = await hre.ethers.getSigners();
  console.log(accounts);
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  console.log('deploying verifier');
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const RsaChallenge = await hre.ethers.getContractFactory("RsaChallenge");
  console.log('deploying challenge contract');
  const rsaChallenge = await RsaChallenge.deploy(await verifier.getAddress());
  await rsaChallenge.waitForDeployment();
  console.log('challenge 33');
  var tx = await rsaChallenge.newChallenge(33, {gasLimit: 500000});
  await tx.wait();
  console.log('challenge 91');
  var tx = await rsaChallenge.newChallenge(91, {gasLimit: 500000});
  await tx.wait();
  console.log('challenge 100');
  var tx = await rsaChallenge.newChallenge(100, {gasLimit: 500000});
  await tx.wait();
  console.log('challenge 131');
  var tx = await rsaChallenge.newChallenge(131, {gasLimit: 500000});
  await tx.wait();
  console.log("Contract deployed to:", await rsaChallenge.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });