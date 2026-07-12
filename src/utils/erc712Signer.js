const { ethers } = require("ethers");
const config = require("./blockchain-config");

const TYPES = {
  AcuseRecibo: [
    { name: "documentHash", type: "bytes32" },
    { name: "signer", type: "address" },
    { name: "timestamp", type: "uint256" },
  ],
};

/**
 * Genera el hash EIP-712 (debe coincidir bit a bit con el que firma el contrato SignatureRegistry)
 */
function generateEIP712Hash(documentHash, signer, timestamp) {
  const domain = config.EIP712_DOMAIN;
  const value = { documentHash, signer, timestamp };
  return ethers.TypedDataEncoder.hash(domain, TYPES, value);
}

function verifySignature(signature, documentHash, signer, timestamp) {
  try {
    const hash = generateEIP712Hash(documentHash, signer, timestamp);
    const recoveredAddress = ethers.recoverAddress(hash, signature);
    return recoveredAddress.toLowerCase() === signer.toLowerCase();
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

function getEIP712Domain() {
  return config.EIP712_DOMAIN;
}

module.exports = {
  generateEIP712Hash,
  verifySignature,
  getEIP712Domain,
  TYPES,
};
