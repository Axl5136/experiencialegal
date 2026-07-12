const express = require("express");
const router = express.Router();
const blockchainController = require("../controllers/blockchainController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Wallet Management
router.post("/wallet/connect", authenticateToken, blockchainController.connectWallet);
router.get("/wallet/status", authenticateToken, blockchainController.getWalletStatus);

// ERC-712 Firmas
router.post("/signature/prepare", authenticateToken, blockchainController.prepareSignature);
router.post("/signature/verify", authenticateToken, blockchainController.verifySignature);
router.get("/signature/verify/:certId", blockchainController.getSignatureProof);

// SBT Credenciales
router.get("/credentials/verify/:walletAddress", blockchainController.verifyCredentials);
router.post("/credentials/emit", authenticateToken, requireRole(["admin", "abogado"]), blockchainController.emitCredential);
router.post("/credentials/revoke", authenticateToken, requireRole(["admin", "abogado"]), blockchainController.revokeCredential);

// Status
router.get("/status", blockchainController.getBlockchainStatus);

module.exports = router;
