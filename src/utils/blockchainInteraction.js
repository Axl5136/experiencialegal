const { ethers } = require("ethers");
const config = require("./blockchain-config");

let provider;
let signatureRegistryContract;
let trustSealsContract;
let signer;

/**
 * Inicializar conexión a Ethereum Sepolia
 */
async function initBlockchain() {
  try {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org";
    provider = new ethers.JsonRpcProvider(rpcUrl);

    if (process.env.SEPOLIA_PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
    }

    signatureRegistryContract = new ethers.Contract(
      config.SIGNATURE_REGISTRY_ADDRESS,
      config.SIGNATURE_REGISTRY_ABI,
      provider
    );

    trustSealsContract = new ethers.Contract(
      config.TRUST_SEALS_ADDRESS,
      config.TRUST_SEALS_ABI,
      provider
    );

    console.log("✅ Blockchain initialized (Sepolia)");
    return { provider, signer, signatureRegistryContract, trustSealsContract };
  } catch (error) {
    console.error("Error initializing blockchain:", error);
    throw error;
  }
}

async function checkContractStatus() {
  try {
    if (!provider) await initBlockchain();
    const code = await provider.getCode(config.SIGNATURE_REGISTRY_ADDRESS);
    return code !== "0x";
  } catch (error) {
    console.error("Error checking contract status:", error);
    return false;
  }
}

async function getWalletCredentials(walletAddress) {
  try {
    if (!trustSealsContract) await initBlockchain();
    const credentials = await trustSealsContract.getCredentials(walletAddress);
    return credentials;
  } catch (error) {
    console.error("Error getting wallet credentials:", error);
    return [];
  }
}

/**
 * Registra una firma EIP-712 ya validada en el contrato SignatureRegistry (on-chain real).
 * signerAddress/timestamp deben ser EXACTAMENTE los mismos valores con los que se firmó
 * (el contrato reconstruye el mismo digest EIP-712 para verificar).
 */
async function recordSignatureOnChain(documentHash, signerAddress, timestamp, signature) {
  try {
    if (!signer || !signatureRegistryContract) await initBlockchain();
    if (!signer) throw new Error("No hay signer configurado (falta SEPOLIA_PRIVATE_KEY)");

    const contractWithSigner = signatureRegistryContract.connect(signer);
    const tx = await contractWithSigner.recordSignature(documentHash, signerAddress, timestamp, signature);
    const receipt = await tx.wait();
    console.log("✅ Signature recorded on-chain, txHash:", receipt.hash);
    return { txHash: receipt.hash, success: true };
  } catch (error) {
    console.error("Error recording signature on-chain:", error);
    return { success: false, error: error.message };
  }
}

async function emitSBT(recipientAddress, credentialType, expiryDays, ipfsHash = "") {
  try {
    if (!signer || !trustSealsContract) await initBlockchain();
    if (!signer) throw new Error("No hay signer configurado (falta SEPOLIA_PRIVATE_KEY)");

    const contractWithSigner = trustSealsContract.connect(signer);
    const tx = await contractWithSigner.issueCredential(
      recipientAddress,
      credentialType,
      expiryDays,
      ipfsHash
    );

    const receipt = await tx.wait();

    const issuedEvent = receipt.logs
      .map((log) => {
        try {
          return trustSealsContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed && parsed.name === "CredentialIssued");
    const tokenId = issuedEvent ? Number(issuedEvent.args.tokenId) : null;

    console.log("✅ SBT emitted, txHash:", receipt.hash, "tokenId:", tokenId);
    return { txHash: receipt.hash, tokenId, success: true };
  } catch (error) {
    console.error("Error emitting SBT:", error);
    return { success: false, error: error.message };
  }
}

async function revokeSBT(recipientAddress, tokenId) {
  try {
    if (!signer || !trustSealsContract) await initBlockchain();
    if (!signer) throw new Error("No hay signer configurado (falta SEPOLIA_PRIVATE_KEY)");

    const contractWithSigner = trustSealsContract.connect(signer);
    const tx = await contractWithSigner.revokeCredential(recipientAddress, tokenId);
    const receipt = await tx.wait();
    console.log("✅ SBT revoked, txHash:", receipt.hash);
    return { txHash: receipt.hash, success: true };
  } catch (error) {
    console.error("Error revoking SBT:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initBlockchain,
  checkContractStatus,
  getWalletCredentials,
  recordSignatureOnChain,
  emitSBT,
  revokeSBT,
};
