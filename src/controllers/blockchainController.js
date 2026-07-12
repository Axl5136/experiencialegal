const { ethers } = require("ethers");
const supabase = require("../utils/supabase");
const erc712Signer = require("../utils/erc712Signer");
const blockchainInteraction = require("../utils/blockchainInteraction");

/**
 * POST /api/blockchain/wallet/connect
 * Conecta wallet del usuario autenticado
 */
async function connectWallet(req, res) {
  try {
    const { address, signature, message } = req.body;
    const userId = req.user.userId;

    const recoveredAddress = ethers.recoverAddress(ethers.hashMessage(message), signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Un usuario tiene una sola wallet activa por chain: conectar una nueva reemplaza la anterior
    await supabase
      .from("user_wallets")
      .delete()
      .eq("user_id", userId)
      .eq("chain_id", 11155111)
      .neq("wallet_address", address.toLowerCase());

    const { data, error } = await supabase
      .from("user_wallets")
      .upsert(
        {
          user_id: userId,
          wallet_address: address.toLowerCase(),
          chain_id: 11155111,
          verified: true,
          verification_signature: signature,
          verification_timestamp: new Date().toISOString(),
        },
        { onConflict: "user_id,wallet_address,chain_id" }
      )
      .select();

    if (error) throw error;

    res.json({ wallet: data[0], verified: true, message: "Wallet connected" });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/blockchain/wallet/status
 */
async function getWalletStatus(req, res) {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return res.json({ wallet: null, verified: false });
    }

    const credentials = await blockchainInteraction.getWalletCredentials(data.wallet_address);

    res.json({
      wallet_address: data.wallet_address,
      verified: data.verified,
      credentials_count: credentials.length,
      chain_id: data.chain_id,
    });
  } catch (error) {
    console.error("Error getting wallet status:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/blockchain/signature/prepare
 * Prepara un hash EIP-712 para ser firmado por el cliente
 */
async function prepareSignature(req, res) {
  try {
    const { expediente_id, document_id } = req.body;
    const userId = req.user.userId;

    const { data: expediente, error: expError } = await supabase
      .from("expedientes")
      .select("id")
      .eq("id", expediente_id)
      .eq("cliente_id", userId)
      .single();

    if (expError || !expediente) {
      return res.status(403).json({ error: "Access denied" });
    }

    const documentHash = ethers.id(document_id || expediente_id);
    const timestamp = Math.floor(Date.now() / 1000);

    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("wallet_address")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      return res.status(400).json({ error: "User wallet not connected" });
    }

    const eip712Hash = erc712Signer.generateEIP712Hash(documentHash, wallet.wallet_address, timestamp);

    res.json({
      eip712Domain: erc712Signer.getEIP712Domain(),
      types: erc712Signer.TYPES,
      value: {
        documentHash,
        signer: wallet.wallet_address,
        timestamp,
      },
      hash: eip712Hash,
      expediente_id,
      document_id,
    });
  } catch (error) {
    console.error("Error preparing signature:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/blockchain/signature/verify
 * Verifica la firma EIP-712 y la registra on-chain en SignatureRegistry
 * IMPORTANTE: timestamp debe ser EXACTAMENTE el mismo que devolvió /signature/prepare,
 * porque forma parte del hash que el usuario firmó.
 */
async function verifySignature(req, res) {
  try {
    const { expediente_id, document_id, signature, address, timestamp } = req.body;
    const userId = req.user.userId;

    if (!timestamp) {
      return res.status(400).json({ error: "timestamp is required (from /signature/prepare)" });
    }

    const documentHash = ethers.id(document_id || expediente_id);

    const isValid = erc712Signer.verifySignature(signature, documentHash, address, timestamp);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const eip712Hash = erc712Signer.generateEIP712Hash(documentHash, address, timestamp);

    const onChain = await blockchainInteraction.recordSignatureOnChain(documentHash, address, timestamp, signature);

    if (!onChain.success) {
      return res.status(502).json({ error: "Blockchain write failed", detail: onChain.error });
    }

    const certificateId = ethers.id(address + documentHash + timestamp).substring(0, 32);

    const { data: signatureRecord, error: dbError } = await supabase
      .from("blockchain_signatures")
      .insert([
        {
          expediente_id,
          document_id,
          user_id: userId,
          wallet_address: address.toLowerCase(),
          document_hash: "\\x" + documentHash.slice(2),
          eip712_hash: "\\x" + eip712Hash.slice(2),
          signature,
          blockchain_tx_hash: onChain.txHash,
          blockchain_timestamp: timestamp,
          verified: true,
          certificate_id: certificateId,
          metadata: { timestamp },
        },
      ])
      .select();

    if (dbError) throw dbError;

    res.json({
      valid: true,
      certId: certificateId,
      txHash: onChain.txHash,
      record: signatureRecord[0],
      message: "Signature recorded on-chain",
    });
  } catch (error) {
    console.error("Error verifying signature:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/blockchain/signature/verify/:certId
 */
async function getSignatureProof(req, res) {
  try {
    const { certId } = req.params;

    const { data: proof, error } = await supabase
      .from("blockchain_signatures")
      .select("*")
      .eq("certificate_id", certId)
      .single();

    if (error || !proof) {
      return res.status(404).json({ error: "Signature proof not found" });
    }

    res.json({
      certId: proof.certificate_id,
      signer: proof.wallet_address,
      timestamp: proof.created_at,
      verified: proof.verified,
      txHash: proof.blockchain_tx_hash,
      expediente_id: proof.expediente_id,
    });
  } catch (error) {
    console.error("Error getting signature proof:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/blockchain/credentials/verify/:walletAddress
 */
async function verifyCredentials(req, res) {
  try {
    const { walletAddress } = req.params;

    const credentials = await blockchainInteraction.getWalletCredentials(walletAddress.toLowerCase());

    const validCredentials = credentials.filter(
      (cred) => !cred.revoked && Number(cred.expiresAt) * 1000 > Date.now()
    );

    res.json({
      wallet: walletAddress.toLowerCase(),
      has_credentials: validCredentials.length > 0,
      credentials_count: validCredentials.length,
      credentials: validCredentials.map((cred) => ({
        type: cred.credentialType,
        issuer: cred.issuer,
        issuedAt: new Date(Number(cred.issuedAt) * 1000).toISOString(),
        expiresAt: new Date(Number(cred.expiresAt) * 1000).toISOString(),
        revoked: cred.revoked,
      })),
    });
  } catch (error) {
    console.error("Error verifying credentials:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/blockchain/credentials/emit (admin/abogado)
 */
async function emitCredential(req, res) {
  try {
    const { user_id, credential_type, expiry_days } = req.body;

    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("wallet_address")
      .eq("user_id", user_id)
      .single();

    if (!wallet) {
      return res.status(400).json({ error: "User wallet not found" });
    }

    const result = await blockchainInteraction.emitSBT(wallet.wallet_address, credential_type, expiry_days, "");

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiry_days);

    const { data: credential, error: dbError } = await supabase
      .from("user_credentials")
      .insert([
        {
          user_id,
          wallet_address: wallet.wallet_address.toLowerCase(),
          credential_type,
          issuer: "DESPACHO_JURIDICO_CDMX",
          sbt_token_id: result.tokenId,
          blockchain_tx_hash: result.txHash,
          issued_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          revoked: false,
        },
      ])
      .select();

    if (dbError) throw dbError;

    res.json({
      success: true,
      credential: credential[0],
      txHash: result.txHash,
      message: "SBT emitted successfully",
    });
  } catch (error) {
    console.error("Error emitting credential:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/blockchain/credentials/revoke (admin/abogado)
 */
async function revokeCredential(req, res) {
  try {
    const { credential_id } = req.body;

    const { data: credential, error: getError } = await supabase
      .from("user_credentials")
      .select("*")
      .eq("id", credential_id)
      .single();

    if (getError || !credential) {
      return res.status(404).json({ error: "Credential not found" });
    }

    const result = await blockchainInteraction.revokeSBT(credential.wallet_address, credential.sbt_token_id || 0);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const { error: updateError } = await supabase
      .from("user_credentials")
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_tx_hash: result.txHash,
      })
      .eq("id", credential_id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      txHash: result.txHash,
      message: "Credential revoked",
    });
  } catch (error) {
    console.error("Error revoking credential:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/blockchain/status
 */
async function getBlockchainStatus(req, res) {
  try {
    const isConnected = await blockchainInteraction.checkContractStatus();

    res.json({
      blockchain_connected: isConnected,
      chain: "Sepolia",
      chain_id: 11155111,
      contracts: {
        SignatureRegistry: process.env.SIGNATURE_REGISTRY_ADDRESS,
        TrustSeals: process.env.TRUST_SEALS_ADDRESS,
      },
    });
  } catch (error) {
    console.error("Error getting blockchain status:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  connectWallet,
  getWalletStatus,
  prepareSignature,
  verifySignature,
  getSignatureProof,
  verifyCredentials,
  emitCredential,
  revokeCredential,
  getBlockchainStatus,
};
