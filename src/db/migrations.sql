CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  role TEXT CHECK (role IN ('turista', 'hotelero', 'cliente', 'abogado', 'admin')) NOT NULL,
  estado TEXT CHECK (estado IN ('activo', 'inactivo', 'suspendido')) DEFAULT 'activo',
  perfil_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS expedientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES users(id),
  abogado_id UUID NOT NULL REFERENCES users(id),
  tipo_caso TEXT CHECK (tipo_caso IN ('laboral', 'civil', 'penal', 'comercial')) NOT NULL,
  estado TEXT CHECK (estado IN ('investigacion', 'juicio', 'sentencia', 'cerrado')) NOT NULL,
  fecha_inicio DATE NOT NULL,
  proxima_audiencia DATE,
  descripcion TEXT,
  link_hash VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expedientes_cliente ON expedientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_abogado ON expedientes(abogado_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);

CREATE TABLE IF NOT EXISTS cronologia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  evento VARCHAR(500) NOT NULL,
  tipo TEXT CHECK (tipo IN ('evento', 'resolucion', 'audiencia')) DEFAULT 'evento',
  visible_cliente BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cronologia_expediente ON cronologia(expediente_id);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_by_role VARCHAR(50),
  descripcion VARCHAR(500),
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_expediente ON documents(expediente_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50),
  expediente_id UUID REFERENCES expedientes(id),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  tokens_used INT,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_user ON conversation_logs(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ═══════════════════════════════════════════════
-- BLOCKCHAIN SEPOLIA (FASE 3 - SUBFASE 3.1)
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  chain_id INT NOT NULL DEFAULT 11155111,
  verified BOOLEAN DEFAULT FALSE,
  verification_signature TEXT,
  verification_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, wallet_address, chain_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_wallet ON user_wallets(wallet_address);

CREATE TABLE IF NOT EXISTS blockchain_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  document_hash BYTEA NOT NULL,
  eip712_hash BYTEA NOT NULL,
  signature TEXT NOT NULL,
  blockchain_tx_hash VARCHAR(66),
  blockchain_timestamp BIGINT,
  verified BOOLEAN DEFAULT FALSE,
  certificate_id VARCHAR(32) UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT verified_needs_tx CHECK (verified = FALSE OR blockchain_tx_hash IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_blockchain_signatures_expediente ON blockchain_signatures(expediente_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_signatures_user ON blockchain_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_signatures_wallet ON blockchain_signatures(wallet_address);

CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  credential_type VARCHAR(50) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  sbt_token_id BIGINT,
  blockchain_tx_hash VARCHAR(66),
  issued_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  revoked_tx_hash VARCHAR(66),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_wallet ON user_credentials(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_credentials_type ON user_credentials(credential_type);
