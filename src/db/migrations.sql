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
