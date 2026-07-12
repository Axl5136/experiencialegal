const fs = require("fs");
const path = require("path");

const SignatureRegistryABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, "blockchain-abis/SignatureRegistry.json"))
).abi;

const TrustSealsABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, "blockchain-abis/TrustSeals.json"))
).abi;

module.exports = {
  SIGNATURE_REGISTRY_ADDRESS: process.env.SIGNATURE_REGISTRY_ADDRESS,
  TRUST_SEALS_ADDRESS: process.env.TRUST_SEALS_ADDRESS,
  SIGNATURE_REGISTRY_ABI: SignatureRegistryABI,
  TRUST_SEALS_ABI: TrustSealsABI,
  SEPOLIA_CHAIN_ID: Number(process.env.SEPOLIA_CHAIN_ID || 11155111),
  EIP712_DOMAIN: {
    name: "ExperienciaLegal",
    version: "1",
    chainId: Number(process.env.SEPOLIA_CHAIN_ID || 11155111),
    verifyingContract: process.env.SIGNATURE_REGISTRY_ADDRESS,
  },
};
