# REQUERIMIENTOS FASE 1 - MVP LEGALTECH "EXPERIENCIA LEGAL"

**Fecha de Elaboración**: Julio 2024  
**Versión**: 1.0  
**Estado**: Listo para desarrollo  
**Audiencia**: Desarrollador + Cursor AI  

---

## ÍNDICE
1. [Visión General](#visión-general)
2. [Arquitectura General](#arquitectura-general)
3. [Requisitos Funcionales](#requisitos-funcionales)
4. [Requisitos Técnicos](#requisitos-técnicos)
5. [Datos Simulados (Mock)](#datos-simulados-mock)
6. [Prompt Maestro (Sistema de IA)](#prompt-maestro-sistema-de-ia)
7. [Wireframes / Descripción de UI](#wireframes--descripción-de-ui)
8. [Flujos de Usuario](#flujos-de-usuario)
9. [Datos de Prueba](#datos-de-prueba)
10. [Checklist de Entrega](#checklist-de-entrega)

---

## VISIÓN GENERAL

### Objetivo
Crear un MVP/Demo funcional de una plataforma LegalTech que utiliza un Agente de IA para facilitar consultas legales en CDMX. La plataforma bifurca la experiencia en 3 roles distintos, cada uno con acceso a información legal diferenciada.

### Contexto del Cliente
- **Nombre**: Experiencia Legal (Despacho de Abogados)
- **Ciudad**: CDMX
- **Objetivo de Demo**: Pitch para incubathon
- **Timeline**: Demo funcional para presentar mañana

### Alcance Fase 1
- ✅ UI/UX completa en React + Tailwind
- ✅ 3 interfaces de usuario distintas (Roles)
- ✅ Lógica de chat simulada (hardcoded, sin APIs externas aún)
- ✅ Admin panel funcional
- ✅ Multi-idioma (ES/EN)
- ❌ NO integración con Claude API en Fase 1
- ❌ NO base de datos real
- ❌ NO autenticación real

---

## ARQUITECTURA GENERAL

### Stack Tecnológico
```
Frontend: React 18+ (Vite)
Styling: Tailwind CSS
State Management: React Context API
Storage: localStorage (sesiones demo)
Routing: React Router v6
Build Tool: Vite
Package Manager: npm/yarn
```

### Estructura de Aplicación
```
experiencialegal.com/
├── Landing Page (Estática)
├── Login (Simulado - roles diferentes)
├── Dashboard (Cambia según rol)
│   ├── Chat Component (Central)
│   └── Sidebar (Dinámico según rol)
├── Admin Panel (Solo abogados)
│   ├── Dashboard expedientes
│   ├── CRUD expedientes
│   └── Generador de links cliente
└── Rutas privadas por cliente
    └── /cliente/{HASH} (Acceso a expediente)
```

### Flujo de Autenticación (Demo)
```
1. Usuario llega a Landing
2. Selecciona rol (Turista/Hotelero/Cliente)
3. Redirige a /login?role={role}
4. Completa login (cualquier email + password)
5. Sistema crea sesión en localStorage
6. Redirige a /dashboard/{role}
7. Sidebar y Chat se renderizan según rol
```

---

## REQUISITOS FUNCIONALES

### RF-001: Landing Page
**Descripción**: Página estática que explica los 3 roles y permite elegir acceso

**Criterios de Aceptación**:
- [ ] Héroe section con título "Asesoría Legal 24/7"
- [ ] 3 cards (Turista, Hotelero, Cliente) con descripción
- [ ] Cada card tiene botón que redirige a /login?role={role}
- [ ] Footer con contacto e información de firma
- [ ] Responsive (mobile first)

**Datos Requeridos**:
- Logo Experiencia Legal (placeholder si no disponible)
- Descripción de cada rol (ver sección 5)

---

### RF-002: Sistema de Login
**Descripción**: Permite autenticación demo (sin validación real)

**Criterios de Aceptación**:
- [ ] Formulario email + password
- [ ] Acepta cualquier combinación (demo)
- [ ] Valida campos no vacíos
- [ ] Redirige a /dashboard/{role} tras submit
- [ ] Guarda user en localStorage: { id, email, role, nombre }
- [ ] Link "Demo credentials" que pre-llena formulario
- [ ] Selector de idioma (ES/EN)

**Demo Credentials Sugeridos**:
```
Turista: turista@demo.com / demo123
Hotelero: hotelero@demo.com / demo123
Cliente: juan@demo.com / demo123
Abogado: maria@demo.com / demo123
```

---

### RF-003: Dashboard - Vista Común
**Descripción**: Layout principal compartido por todos los roles

**Criterios de Aceptación**:
- [ ] Header con logo + nombre usuario + logout
- [ ] Chat component en el centro (60-70% width)
- [ ] Sidebar derecha (30-40% width)
- [ ] Cambio de idioma en header (dropdown ES/EN)
- [ ] Footer con disclaimer legal
- [ ] Responsive: En mobile, sidebar se colapsa

**Layout (Desktop)**:
```
┌─────────────────────────────────────────────────────┐
│  Logo  Hola Juan  [ES/EN]              Logout       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────┐  ┌──────────────────┐ │
│  │                          │  │                  │ │
│  │   CHAT COMPONENT         │  │   SIDEBAR        │ │
│  │   (Mensajes)             │  │   (Dinámico)     │ │
│  │                          │  │                  │ │
│  │  Bot: "¿Cómo puedo...    │  │  Turista:        │ │
│  │  ayudarte?"              │  │  • País origen   │ │
│  │                          │  │  • Guía rápida   │ │
│  │  User: "¿Puedo estacion" │  │  • Contactar     │ │
│  │                          │  │                  │ │
│  │  Bot: "Según el Reg...   │  │  Hotelero:       │ │
│  │                          │  │  • Establecimiento
│  │ [Input field]  [Send]    │  │  • Permisos      │ │
│  └──────────────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────┘
│  © 2024 Experiencia Legal. Disclaimer legal aquí.    │
└─────────────────────────────────────────────────────┘
```

---

### RF-004: Chat Component
**Descripción**: Sistema de conversación entre usuario y agente IA

**Criterios de Aceptación**:
- [ ] Input field para mensaje de usuario
- [ ] Botón "Enviar" (o Enter)
- [ ] Historial de mensajes se muestra en orden cronológico
- [ ] Mensajes de usuario alineados derecha (fondo azul)
- [ ] Mensajes del bot alineados izquierda (fondo gris)
- [ ] Placeholder: "¿Cuál es tu pregunta legal?"
- [ ] Indicador "Escribiendo..." (500ms antes de respuesta)
- [ ] Scroll automático al último mensaje
- [ ] Max 20 mensajes visibles (con scroll)

**Estructura de Mensaje**:
```json
{
  "id": "msg-001",
  "sender": "user" | "bot",
  "text": "¿Puedo estacionar en doble fila?",
  "timestamp": "2024-07-11T14:30:00Z",
  "metadata": {
    "role": "tourist",
    "language": "es"
  }
}
```

---

### RF-005: Sidebar - Rol Turista
**Descripción**: Panel lateral específico para usuario turista

**Criterios de Aceptación**:
- [ ] Card con datos: "Nombre", "País origen", "Días en CDMX"
- [ ] Sección "Guía Rápida Turista" (5 items hardcoded)
- [ ] Botón "📞 Contactar abogado" (no-funcional en demo)
- [ ] Botón "❓ Preguntas Frecuentes" (colapsa/expande)
- [ ] Info: "Disponible 24/7"

**Datos Hardcoded**:
```
Guía Rápida Turista:
1. No estaciones en doble fila
2. Lleva documentos de ID siempre
3. No des dinero a autoridades (es coima)
4. Respeta horarios de establecimientos
5. Verifica tu auto no esté marcado por pico y placa
```

---

### RF-006: Sidebar - Rol Hotelero
**Descripción**: Panel lateral específico para usuario hotelero

**Criterios de Aceptación**:
- [ ] Card con datos del establecimiento (Nombre, RUT, Dirección)
- [ ] Sección "Estado de Cumplimiento" (Visual: Verde/Amarillo/Rojo)
- [ ] Lista de permisos vigentes (Funcionamiento, Salubridad, PC)
- [ ] "Próximos vencimientos" (hardcoded con fechas)
- [ ] Botón "📅 Agendar asesoría" (abre formulario dummy)
- [ ] Botón "📄 Descargar checklist de permisos"

**Estado Cumplimiento**:
```
Verde (✅): Todos los permisos vigentes
Amarillo (⚠️): Algún permiso vence en 30 días
Rojo (❌): Algún permiso vencido
```

---

### RF-007: Sidebar - Rol Cliente Privado
**Descripción**: Panel lateral para cliente con expediente en despacho

**Criterios de Aceptación**:
- [ ] Card con datos del caso (Número expediente, tipo, estado)
- [ ] Barra de progreso visual del estado (Fase 1/2/3)
- [ ] "Próxima audiencia" con fecha y hora
- [ ] Timeline comprimido (últimas 3 acciones)
- [ ] Botón prominente "📞 Contactar abogado"
- [ ] Botón "📄 Descargar documentos"
- [ ] Info: "Abogado asignado: [Nombre]"

**Estados Visuales**:
```
En investigación  → 33%
En juicio        → 66%
Sentencia        → 100%
```

---

### RF-008: Lógica del Agente (Turista)
**Descripción**: Sistema de respuestas para usuario turista

**Criterios de Aceptación**:
- [ ] Extrae palabras clave de pregunta del usuario
- [ ] Busca en base de datos de 5 leyes CDMX
- [ ] Retorna respuesta templada + información específica
- [ ] Si no encuentra match → Respuesta genérica
- [ ] Respuestas en idioma seleccionado (ES/EN)
- [ ] Incluye ejemplos prácticos
- [ ] Termina con CTA ("¿Otra pregunta?")

**5 Leyes Base (Turista)**:
1. Reglamento de Tránsito CDMX (RT-CDMX)
2. Ley de Anticorrupción (LAC-2020)
3. Norma de Salubridad (NOM-251-SSA) - Parcial
4. Protección Civil (LPCC-2023) - Parcial
5. Seguridad ciudadana (General)

**Palabras Clave por Ley**:
```
RT-CDMX: estacionar, multa, placas, velocidad, tránsito, auto, coche
LAC-2020: coima, soborno, autoridad, corrupción, derechos, transparencia
NOM-251: comida, calle, higiene, restaurante, sanidad
LPCC: seguridad, protección, evacuación, alarma
```

---

### RF-009: Lógica del Agente (Hotelero)
**Descripción**: Sistema de respuestas para usuario hotelero

**Criterios de Aceptación**:
- [ ] Extrae palabras clave de pregunta del usuario
- [ ] Busca en base de datos de 5 leyes con enfoque comercial
- [ ] Retorna PROCESO PASO A PASO si es trámite
- [ ] Incluye datos: Tiempo aproximado, costo, documentos
- [ ] Si no encuentra → Sugiere contactar abogado
- [ ] Respuestas en idioma seleccionado
- [ ] CTAs específicas: "Agendar asesoría"

**5 Leyes Base (Hotelero)**:
1. Reglamento de Tránsito (RF-CDMX) - Enfoque carga/descarga
2. Código Civil (CPC-2023) - Arrendamientos
3. Norma de Salubridad (NOM-251-SSA)
4. Protección Civil (LPCC-2023)
5. Ley de Anticorrupción (LAC-2020)

**Palabras Clave por Ley**:
```
CPC: inquilino, arrendamiento, contrato, desalojo, caducidad
NOM-251: manipulación, alimentos, licencia, inspector, COFEPRIS
LPCC: evacuación, extintores, señalización, protocolo, inspección
Trámites: permiso, funcionamiento, licencia, renovar, requisitos
```

---

### RF-010: Lógica del Agente (Cliente Privado)
**Descripción**: Sistema altamente restringido para cliente con expediente

**Criterios de Aceptación**:
- [ ] Solo extrae información del JSON del expediente
- [ ] Detecta intentos de preguntar sobre estrategia/asesoría
- [ ] Para preguntas bloqueadas: Retorna template de redireccionamiento
- [ ] Para preguntas permitidas: Extrae datos del expediente
- [ ] Nunca da interpretación legal
- [ ] Responde en idioma del cliente
- [ ] Siempre ofrece opción de contactar abogado

**Palabras BLOQUEADAS** (Asesoría):
```
"ganar", "estrategia", "defensa", "costo", "justo", "engaño", 
"qué hacer", "recomendación", "chances", "posibilidad"
```

**Palabras PERMITIDAS** (Información de estado):
```
"etapa", "audiencia", "documento", "qué pasó", "cronología", 
"estado", "próximo", "actualización", "documento"
```

---

### RF-011: Admin Panel - Dashboard
**Descripción**: Panel de control para abogados

**Criterios de Aceptación**:
- [ ] Login abogado separado (email/password simulado)
- [ ] Dashboard mostrando KPIs: # Clientes, # Expedientes, # Consultas
- [ ] Tabla de expedientes activos (Nombre cliente, Tipo caso, Estado)
- [ ] Botón "➕ Crear nuevo expediente"
- [ ] Botón "Ver detalles" en cada fila
- [ ] Search/filter por nombre o tipo
- [ ] Responsive

**KPI Simples** (Hardcoded para demo):
```
2 Expedientes Activos
5 Clientes
12 Consultas esta semana
```

---

### RF-012: Admin Panel - CRUD Expedientes
**Descripción**: Crear, leer, actualizar expedientes

**Criterios de Aceptación**:
- [ ] Formulario para crear nuevo expediente
- [ ] Campos: Nombre cliente, Tipo caso, Estado, Fecha inicio, Próxima audiencia, Abogado, Descripción
- [ ] Guardar nuevo expediente (se guarda en localStorage)
- [ ] Ver expediente: Muestra todos los datos
- [ ] Editar expediente: Permite cambiar campos
- [ ] Timeline visual de cronología de eventos
- [ ] Botón "➕ Agregar evento/nota" → Input fecha + descripción
- [ ] Botón "Generar link cliente" → Copia link a portapapeles

**Campos del Formulario**:
```
- Número expediente (Auto-generated: EXP-2024-XXX)
- Nombre cliente (Text)
- Email cliente (Email)
- Tipo de caso (Dropdown: Laboral/Penal/Civil/Comercial)
- Estado (Dropdown: Investigación/Juicio/Sentencia/Cerrado)
- Fecha inicio (Date picker)
- Próxima audiencia (Date picker)
- Abogado asignado (Dropdown)
- Descripción (Textarea)
- Documentos (File upload - simulado)
```

---

### RF-013: Admin Panel - Link Cliente
**Descripción**: Generar y compartir acceso privado para cliente

**Criterios de Aceptación**:
- [ ] Botón en cada expediente "Generar link cliente"
- [ ] Genera hash único (ej: abc123xyz)
- [ ] Crea URL: experiencialegal.com/cliente/{hash}
- [ ] Muestra link en modal (con copy button)
- [ ] Cliente accede sin login
- [ ] Datos persistentes en sessionStorage del link

---

### RF-014: Rutas Cliente Privado (/cliente/{HASH})
**Descripción**: Acceso sin autenticación a expediente específico

**Criterios de Aceptación**:
- [ ] URL /cliente/{hash} accesible sin login
- [ ] Valida que hash exista (simulado)
- [ ] Muestra interface de Cliente Privado
- [ ] Chat + Sidebar con datos del expediente
- [ ] NO permite cambiar de expediente
- [ ] Botón "Contactar abogado" funciona (simula envío de mensaje)
- [ ] Opción "Volver a login" en header

---

### RF-015: Multi-idioma (ES/EN)
**Descripción**: Interfaz completamente traducida

**Criterios de Aceptación**:
- [ ] Selector de idioma visible en todos los screens
- [ ] Cambia todos los textos UI al cambiar idioma
- [ ] Persiste preferencia en localStorage
- [ ] Respuestas del bot en idioma seleccionado
- [ ] Archivos: locales/es.json, locales/en.json
- [ ] Todos los textos originarios de JSON

**Textos a Traducir**:
- Labels de botones
- Placeholders de input
- Mensajes de error
- Respuestas del agente (templates)
- Nombres de leyes/reglamentos

---

## REQUISITOS TÉCNICOS

### RT-001: Estructura del Proyecto
```
/proyecto-legal-tech
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Chat/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── MessageList.jsx
│   │   │   └── InputField.jsx
│   │   ├── Sidebar/
│   │   │   ├── SidebarTourist.jsx
│   │   │   ├── SidebarHotelier.jsx
│   │   │   └── SidebarPrivateClient.jsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ExpedienteManager.jsx
│   │   │   ├── ExpedienteForm.jsx
│   │   │   └── ExpedienteDetail.jsx
│   │   └── Common/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── LanguageSelector.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useLegalAgent.js
│   │   └── useLanguage.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── LegalAgentContext.jsx
│   │   └── LanguageContext.jsx
│   ├── data/
│   │   ├── laws.json
│   │   ├── users.json
│   │   ├── expedientes.json
│   │   └── templates.json
│   ├── locales/
│   │   ├── es.json
│   │   └── en.json
│   ├── utils/
│   │   ├── legalEngine.js
│   │   ├── keywordMatcher.js
│   │   ├── responseTemplates.js
│   │   └── storage.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── tailwind.config.js
│   ├── App.jsx
│   └── main.jsx
├── .env (Variables de entorno)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### RT-002: Dependencias
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "i18next": "^23.x",
    "react-i18next": "^13.x"
  },
  "devDependencies": {
    "vite": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

### RT-003: Routing
```javascript
Routes:
  /                      → Landing
  /login                 → Login
  /dashboard/:role       → Dashboard (Protegida)
  /admin                 → Admin Login
  /admin/dashboard       → Admin Dashboard (Protegida)
  /admin/expediente/:id  → Ver/Editar expediente (Protegida)
  /cliente/:hash         → Acceso cliente privado (NO protegida)
  *                      → 404
```

### RT-004: Storage (localStorage)
```javascript
// Auth
localStorage.setItem('user', JSON.stringify({
  id: 'TOUR-001',
  email: 'turista@demo.com',
  role: 'tourist',
  nombre: 'Michael Johnson',
  idioma: 'es'
}))

// Conversación
localStorage.setItem('conversation', JSON.stringify([
  { id: 'msg-001', sender: 'user', text: '...', timestamp: '...' },
  { id: 'msg-002', sender: 'bot', text: '...', timestamp: '...' }
]))

// Expedientes (Admin)
localStorage.setItem('expedientes', JSON.stringify([...]))

// Preferencias
localStorage.setItem('preferences', JSON.stringify({
  language: 'es',
  theme: 'light'
}))
```

### RT-005: Context API
```javascript
// AuthContext
{ user, login, logout, isAuthenticated }

// LegalAgentContext
{ 
  sendMessage,
  getResponse,
  conversationHistory,
  currentRole
}

// LanguageContext
{ 
  language,
  setLanguage,
  t (función traducción)
}
```

---

## DATOS SIMULADOS (MOCK)

### JSON: Usuarios Demo

**Turista**:
```json
{
  "id": "TOUR-001",
  "email": "turista@demo.com",
  "password": "demo123",
  "role": "tourist",
  "nombre": "Michael Johnson",
  "pais_origen": "USA - California",
  "idioma": "en",
  "dias_en_cdmx": 5,
  "intereses": ["Tránsito", "Seguridad"],
  "creado": "2024-07-11"
}
```

**Hotelero**:
```json
{
  "id": "HOT-001",
  "email": "hotelero@demo.com",
  "password": "demo123",
  "role": "hotelier",
  "nombre": "Carlos Reyes Martínez",
  "establecimiento": {
    "nombre": "Restaurante El Chilango",
    "tipo": "Restaurante",
    "direccion": "Paseo de la Reforma 505, Cuauhtémoc, CDMX",
    "rfc": "RFC-123456789",
    "telefono": "+52 55 1234-5678"
  },
  "idioma": "es",
  "permisos_vigentes": [
    {
      "nombre": "Funcionamiento",
      "estado": "Vigente",
      "vencimiento": "2025-07-11"
    },
    {
      "nombre": "Salubridad",
      "estado": "Vigente",
      "vencimiento": "2024-12-31"
    },
    {
      "nombre": "Protección Civil",
      "estado": "Vigente",
      "vencimiento": "2025-03-15"
    }
  ],
  "creado": "2024-07-11"
}
```

**Cliente Privado**:
```json
{
  "id": "CLI-001",
  "email": "juan@demo.com",
  "password": "demo123",
  "role": "private_client",
  "nombre": "Juan Pérez García",
  "idioma": "es",
  "expediente": {
    "id": "EXP-2024-001",
    "tipo_caso": "Laboral",
    "estado": "En investigación",
    "fecha_inicio": "2024-01-15",
    "proxima_audiencia": "2024-08-20T10:00:00Z",
    "lugar_audiencia": "Juzgado Laboral Primero, CDMX",
    "abogado_asignado": "Lic. María López",
    "abogado_email": "maria@experiencialegal.com",
    "abogado_telefono": "+52 55 5555-5555",
    "descripcion": "Demanda por despido injustificado",
    "documentos": [
      {
        "id": "DOC-001",
        "nombre": "Demanda.pdf",
        "fecha_subida": "2024-01-15",
        "tipo": "Demanda",
        "url_simulada": "/docs/demanda.pdf"
      },
      {
        "id": "DOC-002",
        "nombre": "Contrato_Laboral.pdf",
        "fecha_subida": "2023-06-01",
        "tipo": "Evidencia",
        "url_simulada": "/docs/contrato.pdf"
      },
      {
        "id": "DOC-003",
        "nombre": "Comunicaciones_Email.pdf",
        "fecha_subida": "2024-02-10",
        "tipo": "Evidencia",
        "url_simulada": "/docs/emails.pdf"
      }
    ],
    "cronologia": [
      {
        "id": "CRONO-001",
        "fecha": "2024-01-15",
        "tipo": "Evento",
        "titulo": "Presentación de demanda",
        "descripcion": "Presentamos la demanda ante el juzgado",
        "visible_cliente": true
      },
      {
        "id": "CRONO-002",
        "fecha": "2024-02-10",
        "tipo": "Resolución",
        "titulo": "Juzgado solicita documentación",
        "descripcion": "Se solicitan pruebas adicionales",
        "visible_cliente": true
      },
      {
        "id": "CRONO-003",
        "fecha": "2024-07-01",
        "tipo": "Evento",
        "titulo": "Revisión de pruebas",
        "descripcion": "Nuestro equipo revisa documentación",
        "visible_cliente": false
      },
      {
        "id": "CRONO-004",
        "fecha": "2024-08-20",
        "tipo": "Audiencia",
        "titulo": "Próxima audiencia",
        "descripcion": "Pendiente",
        "visible_cliente": true
      }
    ]
  },
  "creado": "2024-03-20"
}
```

**Abogado (Admin)**:
```json
{
  "id": "ABG-001",
  "email": "maria@experiencialegal.com",
  "password": "demo123",
  "role": "lawyer",
  "nombre": "Lic. María López Sánchez",
  "especialidad": "Derecho Laboral",
  "telefono": "+52 55 5555-5555",
  "clientes_asignados": ["CLI-001", "CLI-002"],
  "expedientes": ["EXP-2024-001", "EXP-2024-002"],
  "creado": "2023-01-01"
}
```

### JSON: Base de Leyes (5 principales CDMX)

```json
{
  "leyes": [
    {
      "id": "RT-CDMX",
      "nombre": "Reglamento de Tránsito CDMX",
      "nombre_en": "Mexico City Traffic Regulations",
      "descripcion": "Regulaciones sobre circulación vehicular",
      "aplicable_a": ["tourist", "hotelier"],
      "temas": [
        {
          "keyword": ["estacionar", "doble fila", "parking"],
          "titulo": "Estacionamiento",
          "contenido_es": "Según el Reglamento de Tránsito CDMX, está PROHIBIDO estacionar en doble fila en cualquier horario, EXCEPTO en zonas de carga/descarga entre 06:00-09:00 y 18:00-20:00. Multa: $1,200-$2,500 MXN + remolque del vehículo.",
          "contenido_en": "According to CDMX Traffic Regulations, parking in double row is PROHIBITED at any time, EXCEPT in loading/unloading zones between 06:00-09:00 and 18:00-20:00. Fine: $1,200-$2,500 MXN + towing."
        },
        {
          "keyword": ["multa", "velocidad", "exceso"],
          "titulo": "Límites de Velocidad y Multas",
          "contenido_es": "Límites en CDMX: Zona escolar 40 km/h, Zona residencial 50 km/h, Avenidas 60 km/h, Periférico 80 km/h. Multa por exceso: $1,500-$3,000 MXN según exceso.",
          "contenido_en": "Speed limits in CDMX: School zone 40 km/h, Residential 50 km/h, Avenues 60 km/h, Ring Road 80 km/h. Fine for speeding: $1,500-$3,000 MXN."
        },
        {
          "keyword": ["documentos", "placas", "verificación"],
          "titulo": "Documentos y Placas",
          "contenido_es": "Debes llevar: Licencia, Comprobante propiedad, Verificación vigente. Sin verificación vigente: Multa $2,500+ MXN. Placas ilegibles: Multa $1,000 MXN.",
          "contenido_en": "You must carry: Driver's license, Ownership proof, Valid inspection. Without inspection: Fine $2,500+ MXN. Illegible plates: Fine $1,000 MXN."
        }
      ]
    },
    {
      "id": "LAC-2020",
      "nombre": "Ley de Anticorrupción CDMX",
      "nombre_en": "CDMX Anti-Corruption Law",
      "descripcion": "Derechos y obligaciones en trámites con autoridades",
      "aplicable_a": ["tourist", "hotelier"],
      "temas": [
        {
          "keyword": ["coima", "soborno", "dinero", "autoridad"],
          "titulo": "Derechos en Trámites",
          "contenido_es": "NO es obligatorio dar dinero a autoridades. Si te piden 'cooperación' o 'propina', PUEDES NEGARTE. Es tu derecho. Reporta en: Contraloría CDMX (55-5242-4500) o app 'Denuncia Vial'.",
          "contenido_en": "It is NOT mandatory to give money to authorities. If they ask for 'cooperation' or 'tip', you CAN refuse. It's your right. Report to: CDMX Controller (55-5242-4500) or 'Denuncia Vial' app."
        },
        {
          "keyword": ["corrupción", "reporte", "denuncia", "transparencia"],
          "titulo": "Cómo Reportar Abuso",
          "contenido_es": "Si experimentas presión de autoridades: 1) Anota nombre, placa, hora. 2) Toma foto/video si es seguro. 3) Llamar al 911 o Contraloría. 4) No entres en confrontación.",
          "contenido_en": "If pressured by authorities: 1) Note name, badge, time. 2) Take photo/video if safe. 3) Call 911 or Controller. 4) Don't confront."
        }
      ]
    },
    {
      "id": "NOM-251-SSA",
      "nombre": "Norma de Salubridad (NOM-251-SSA)",
      "nombre_en": "Health Sanitation Standard",
      "descripcion": "Regulaciones de manipulación de alimentos",
      "aplicable_a": ["hotelier"],
      "temas": [
        {
          "keyword": ["manipulación", "alimentos", "comida", "licencia", "sanitaria"],
          "titulo": "Licencia de Salubridad",
          "contenido_es": "Todo establecimiento que manipule alimentos necesita LICENCIA SANITARIA de la Secretaría de Salud. Requisitos: Local limpio, Personal con capacitación, Refrigeración adecuada, Documentación de proveedores. Costo: $500-$1,000 MXN. Tiempo: 7-15 días.",
          "contenido_en": "Any food handling establishment needs SANITARY LICENSE from Health Secretary. Requirements: Clean premises, Trained staff, Proper refrigeration, Supplier documentation. Cost: $500-$1,000 MXN. Time: 7-15 days."
        },
        {
          "keyword": ["inspector", "inspección", "COFEPRIS", "violación"],
          "titulo": "Inspecciones de Salubridad",
          "contenido_es": "COFEPRIS puede inspeccionar sin aviso previo. Verifican: Manipulación, Temperaturas, Fechas de caducidad, Higiene. Violaciones: Clausura temporal ($5,000+) o permanente si reincidencia.",
          "contenido_en": "COFEPRIS can inspect without notice. They check: Handling, Temperatures, Expiration dates, Hygiene. Violations: Temporary ($5,000+) or permanent closure if repeat."
        }
      ]
    },
    {
      "id": "LPCC-2023",
      "nombre": "Ley de Protección Civil CDMX",
      "nombre_en": "CDMX Civil Protection Law",
      "descripcion": "Obligaciones de seguridad en establecimientos",
      "aplicable_a": ["hotelier"],
      "temas": [
        {
          "keyword": ["evacuación", "salida", "emergencia", "protocolo"],
          "titulo": "Planos de Evacuación",
          "contenido_es": "Toda empresa debe tener: 1) Plano de evacuación visible. 2) Rutas de escape señalizadas. 3) Puntos de reunión marcados. 4) Simulacros trimestrales. Incumplimiento: Multa $2,000-$10,000 MXN.",
          "contenido_en": "Every business must have: 1) Visible evacuation plan. 2) Marked escape routes. 3) Assembly points. 4) Quarterly drills. Non-compliance: Fine $2,000-$10,000 MXN."
        },
        {
          "keyword": ["extintores", "señalización", "equipamiento"],
          "titulo": "Equipamiento de Seguridad",
          "contenido_es": "Requisitos: 1) Extintores (1 cada 15m²). 2) Señalización de salidas (500 lux). 3) Iluminación de emergencia. 4) Sistema de detección de humo (opcional pero recomendado). Revisión anual obligatoria.",
          "contenido_en": "Requirements: 1) Fire extinguishers (1 per 15m²). 2) Exit signage (500 lux). 3) Emergency lighting. 4) Smoke detection (optional but recommended). Annual review mandatory."
        }
      ]
    },
    {
      "id": "CPC-2023",
      "nombre": "Código de Procedimientos Civiles CDMX",
      "nombre_en": "CDMX Civil Procedure Code",
      "descripcion": "Arrendamientos, contratos, y resolución de conflictos",
      "aplicable_a": ["hotelier"],
      "temas": [
        {
          "keyword": ["inquilino", "arrendamiento", "contrato", "renta"],
          "titulo": "Derechos del Arrendatario",
          "contenido_es": "Derechos: 1) Recibir recibo de pago. 2) Casa en buen estado. 3) No entrada sin aviso. 4) Privacidad. El inquilino NO puede ser desalojado sin proceso legal (mínimo 60 días aviso).",
          "contenido_en": "Rights: 1) Receipt for payment. 2) Property in good condition. 3) No entry without notice. 4) Privacy. Tenant cannot be evicted without legal process (minimum 60 days notice)."
        },
        {
          "keyword": ["desalojo", "caducidad", "terminación"],
          "titulo": "Proceso de Desalojo",
          "contenido_es": "Para desalojar: 1) Notificación legal (60+ días). 2) Demanda ante juzgado. 3) Audiencia (mínimo 2 comparecencias). 4) Sentencia. 5) Ejecución de sentencia. Tiempo total: 6-12 meses. PROHIBIDO cortes de agua/luz o acoso.",
          "contenido_en": "To evict: 1) Legal notice (60+ days). 2) Lawsuit at court. 3) Hearing (min 2 appearances). 4) Judgment. 5) Enforcement. Total time: 6-12 months. PROHIBITED: Water/electricity cuts or harassment."
        }
      ]
    }
  ]
}
```

---

## PROMPT MAESTRO (SISTEMA DE IA)

Este prompt es la "lógica central" que Cursor debe implementar en `legalEngine.js`:

```javascript
/*
=== PROMPT MAESTRO: AGENTE LEGAL CONTEXTUAL ===

Sistema: Asistente Legal Informativo de "Experiencia Legal" (MVP Demo)
Versión: 1.0
Fecha: Julio 2024

REGLA FUNDAMENTAL (Aplica a TODOS los roles):
- Lenguaje: Claro, sin jerga legal innecesaria.
- Tono: Amigable, profesional.
- Límite de Responsabilidad: Si algo requiere asesoría legal, REDIRIGE.
*/

// Pseudocódigo para implementación

function handleUserMessage(userInput, userRole, userLanguage) {
  
  // 1. Normalizar entrada
  const cleanedInput = userInput.toLowerCase().trim();
  
  // 2. Extraer palabras clave
  const keywords = extractKeywords(cleanedInput);
  
  // 3. Según rol, elegir lógica
  
  if (userRole === 'TOURIST' || userRole === 'HOTELIER') {
    return handlePublicUserQuery(keywords, userRole, userLanguage);
  }
  
  if (userRole === 'PRIVATE_CLIENT') {
    return handlePrivateClientQuery(keywords, userLanguage, clientExpediente);
  }
  
}

function handlePublicUserQuery(keywords, userRole, userLanguage) {
  
  // Buscar en BD de leyes
  const matchedLaw = findBestMatch(keywords, userRole);
  
  if (matchedLaw) {
    // Generar respuesta de template
    const response = buildResponse({
      template: matchedLaw.contenido,
      language: userLanguage,
      role: userRole,
      keywords: keywords
    });
    
    return response + "\n\n¿Hay algo más que necesites?";
  }
  
  // Si no encontró match
  return getGenericNotFoundResponse(userLanguage, userRole);
}

function handlePrivateClientQuery(keywords, userLanguage, expediente) {
  
  // Detectar si es pregunta de estrategia/asesoría
  if (isStrategyQuestion(keywords)) {
    return getBlockedStrategyResponse(userLanguage, expediente);
  }
  
  // Buscar info en expediente
  const info = extractExpedienteInfo(keywords, expediente);
  
  if (info) {
    return buildExpedienteResponse(info, expediente, userLanguage);
  }
  
  return "No encontré esa información en tu expediente. ¿Quieres que contacte a tu abogado?";
}

function findBestMatch(keywords, userRole) {
  // Buscar palabra clave en BD de leyes
  // Retornar tema que más coincida
}

function extractKeywords(text) {
  // Splitear por espacios, remover stopwords (es, la, de, etc)
  // Retornar array de palabras relevantes
}

function isStrategyQuestion(keywords) {
  const blockedKeywords = [
    'ganar', 'estrategia', 'defensa', 'costo', 'justo', 'engaño',
    'hacer', 'recomendación', 'chances', 'posibilidad'
  ];
  return blockedKeywords.some(kw => keywords.includes(kw));
}

function getBlockedStrategyResponse(userLanguage, expediente) {
  const responses = {
    es: `Entiendo tu preocupación, ${expediente.cliente}. Para decisiones estratégicas, 
lo mejor es hablar directamente con ${expediente.abogado_asignado}.

Mientras tanto, aquí va lo que puedo confirmar:
- Estado: ${expediente.estado}
- Próxima audiencia: ${expediente.proxima_audiencia}

¿Quieres que enviemos un mensaje a ${expediente.abogado_asignado}?`,
    en: `I understand your concern, ${expediente.cliente}. For strategic decisions, 
it's best to speak directly with ${expediente.abogado_asignado}.

Meanwhile, here's what I can confirm:
- Status: ${expediente.estado}
- Next hearing: ${expediente.proxima_audiencia}

Would you like me to send a message to ${expediente.abogado_asignado}?`
  };
  
  return responses[userLanguage];
}
```

---

## WIREFRAMES / DESCRIPCIÓN DE UI

### Landing Page
```
┌─────────────────────────────────────────────────────┐
│  Logo Experiencia Legal                    Contacto │
├─────────────────────────────────────────────────────┤
│                                                       │
│         ASESORÍA LEGAL 24/7                         │
│                                                       │
│   Reducimos la fricción legal con IA                │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  👤 TURISTA  │  │🏨 HOTELERO   │  │⚖️ CLIENTE    ││
│  ├──────────────┤  ├──────────────┤  ├──────────────┤│
│  │Desconoces    │  │Complejidad   │  │Saturación    ││
│  │leyes locales │  │burocrática   │  │de consultas  ││
│  │              │  │              │  │              ││
│  │[Acceder]     │  │[Acceder]     │  │[Acceder]     ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                       │
├─────────────────────────────────────────────────────┤
│  Sobre nosotros | Blog | Contacto | © 2024         │
└─────────────────────────────────────────────────────┘
```

### Login Page
```
┌─────────────────────────────────────────────────────┐
│  Logo Experiencia Legal                    [ES/EN]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│              INICIA SESIÓN                          │
│                                                       │
│  Tipo: Turista | Hotelero | Cliente | Abogado      │
│                                                       │
│  Email:      [________________]                     │
│  Contraseña: [________________]                     │
│                                                       │
│  [Iniciar sesión]                                   │
│                                                       │
│  Demo credentials: turista@demo.com / demo123      │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Dashboard - Estructura General
```
┌──────────────────────────────────────────────────────────────┐
│  Logo  Hola Michael  [ES/EN]              Logout            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────┐  ┌──────────────────┐  │
│  │ Bot: ¿Cómo puedo ayudarte?     │  │ TURISTA          │  │
│  │                                 │  ├──────────────────┤  │
│  │ User: ¿Puedo estacionar?       │  │ Michael Johnson  │  │
│  │                                 │  │ USA - California │  │
│  │ Bot: Según el RT-CDMX...       │  │ 5 días en CDMX   │  │
│  │                                 │  │                  │  │
│  │ [Escribiendo...]               │  │ ✅ Guía Rápida   │  │
│  │                                 │  │  1. No estacion  │  │
│  │                                 │  │  2. Lleva ID     │  │
│  │ [Escribe aquí...] [Enviar]     │  │                  │  │
│  │                                 │  │ [📞 Contactar]  │  │
│  └─────────────────────────────────┘  └──────────────────┘  │
│                                                                │
│ © 2024 Experiencia Legal. Disclaimer: Esto no es asesoría   │
└──────────────────────────────────────────────────────────────┘
```

### Admin Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Logo  Admin - María López  [ES/EN]        Logout            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  DASHBOARD EXPEDIENTES                                       │
│                                                                │
│  2 Expedientes | 5 Clientes | 12 Consultas esta semana      │
│                                                                │
│  [➕ Crear nuevo expediente]  [Buscar...]                    │
│                                                                │
│  Expediente          Tipo      Estado         Audiencia       │
│  ─────────────────────────────────────────────────────────── │
│  EXP-2024-001  Laboral    En investig.  20/08/2024          │
│  EXP-2024-002  Civil      En juicio     15/09/2024          │
│                                                                │
│  [Ver detalles] [Ver detalles]                               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## FLUJOS DE USUARIO

### Flujo 1: Turista Consulta Tránsito
```
1. Entra a landing
2. Selecciona "Soy Turista"
3. Redirige a /login?role=tourist
4. Login (turista@demo.com / demo123)
5. Navega a /dashboard/tourist
6. Ve sidebar con datos y guía rápida
7. Pregunta: "¿Multa por estacionar en doble fila?"
8. Sistema extrae keywords: ["multa", "estacionar"]
9. Busca en RT-CDMX
10. Retorna respuesta templada + info específica
11. Turista lee, hace otra pregunta o se va
```

### Flujo 2: Hotelero Obtiene Proceso de Permisos
```
1. Llega a landing
2. Selecciona "Soy Hotelero"
3. Login (hotelero@demo.com / demo123)
4. Ve sidebar: "Restaurante El Chilango" + Status: Verde
5. Pregunta: "¿Qué permisos necesito?"
6. Sistema extrae: ["permiso", "requisito"]
7. Busca en CPC-2023 y NOM-251
8. Retorna: PROCESO PASO A PASO (5 pasos)
   - Paso 1: Licencia de Funcionamiento ($800, 15 días)
   - Paso 2: Licencia Sanitaria ($500, 7 días)
   - etc.
9. Hotelero revisa, puede hacer otra pregunta
10. Si necesita asesoría, botón "Agendar" → Formulario dummy
```

### Flujo 3: Cliente Privado Revisa Su Caso
```
1. Recibe link: experiencialegal.com/cliente/abc123xyz
2. NO necesita login
3. Ve /cliente/abc123xyz
4. Sidebar: "EXP-2024-001 - Laboral - En investigación"
5. Pregunta: "¿En qué etapa está?"
6. Sistema busca en JSON expediente
7. Retorna: Estado + Cronología + Próxima audiencia
8. Pregunta: "¿Voy a ganar?"
9. BLOQUEADO: Sistema detecta palabra "ganar"
10. Respuesta: "Eso lo ves con la Lic. María López..."
11. Botón "[📞 Contactar]" → Simula envío de notificación
```

### Flujo 4: Abogado Crea Expediente
```
1. Va a /admin
2. Login (maria@experiencialegal.com / demo123)
3. Ve /admin/dashboard con KPIs
4. Botón "➕ Crear nuevo"
5. Completa formulario:
   - Cliente: Juan Pérez
   - Tipo: Laboral
   - Estado: Investigación
   - Próxima audiencia: 20/08/2024
   - etc.
6. Guarda → Se almacena en localStorage
7. Ve expediente en listado
8. Click "Ver detalles" → Abre /admin/expediente/EXP-2024-001
9. Puede editar, agregar eventos, descargar documentos
10. Botón "Generar link cliente" → Copia: experiencialegal.com/cliente/abc123
11. Envía link a cliente por email (simulado)
```

---

## DATOS DE PRUEBA

### Expedientes Pre-Cargados (localStorage inicial)

```json
[
  {
    "id": "EXP-2024-001",
    "cliente": "Juan Pérez García",
    "tipo_caso": "Laboral",
    "estado": "En investigación",
    "fecha_inicio": "2024-01-15",
    "proxima_audiencia": "2024-08-20T10:00:00Z",
    "abogado": "Lic. María López",
    "documentos": 3,
    "hash_cliente": "abc123xyz"
  },
  {
    "id": "EXP-2024-002",
    "cliente": "María García Reyes",
    "tipo_caso": "Civil",
    "estado": "En juicio",
    "fecha_inicio": "2024-03-01",
    "proxima_audiencia": "2024-09-15T14:30:00Z",
    "abogado": "Lic. María López",
    "documentos": 5,
    "hash_cliente": "def456uvw"
  }
]
```

### Mensajes de Demo (para pruebas)

| Rol | Pregunta | Respuesta Esperada |
|-----|----------|-------------------|
| Turista | "¿Puedo estacionar en doble fila?" | Info RT-CDMX + multa |
| Turista | "¿Qué hago si me piden coima?" | Info LAC-2020 + derechos |
| Hotelero | "¿Permisos para restaurante?" | 5 pasos (Funcionamiento, Salubridad, PC) |
| Hotelero | "¿Qué inspecciona Salubridad?" | Checklist NOM-251 |
| Cliente | "¿En qué etapa?" | Estado + cronología |
| Cliente | "¿Voy a ganar?" | BLOQUEADO + Redirige a abogado |

---

## CHECKLIST DE ENTREGA

### Funcionalidad Básica
- [ ] Landing page renderiza correctamente
- [ ] Botones de 3 roles redirigen a login
- [ ] Login acepta credenciales demo
- [ ] Sesión se guarda en localStorage
- [ ] Logout limpia sesión

### Dashboard - Componentes
- [ ] Header con logo, nombre, idioma, logout
- [ ] Chat renderiza mensajes (user/bot diferenciados)
- [ ] Input permite escribir y enviar
- [ ] Sidebar renderiza según rol
- [ ] Footer con disclaimer

### Lógica de IA (Agente)
- [ ] Extrae palabras clave de entrada
- [ ] Busca en BD de 5 leyes
- [ ] Retorna respuesta templada + contexto
- [ ] Maneja idiomas ES/EN
- [ ] Redirige a abogado si no sabe

### Roles Específicos
- [ ] **Turista**: Sidebar muestra datos, guía rápida
- [ ] **Hotelero**: Sidebar muestra establecimiento, permisos, status
- [ ] **Cliente**: Chat BLOQUEADO para asesoría, solo lee expediente

### Admin Panel
- [ ] Login abogado funciona
- [ ] Dashboard muestra KPIs
- [ ] Listar expedientes
- [ ] Crear expediente (formulario completo)
- [ ] Ver/Editar expediente
- [ ] Agregar evento a cronología
- [ ] Generar link cliente

### Multi-idioma
- [ ] Selector de idioma visible
- [ ] Cambia todos los textos
- [ ] Respuestas del bot en idioma
- [ ] Persiste en localStorage

### Mobile Responsiveness
- [ ] Landing responsive
- [ ] Dashboard responsive (sidebar colapsa)
- [ ] Chat usable en móvil
- [ ] Admin responsive

### Testing Manual
- [ ] Probar flujo turista completo
- [ ] Probar flujo hotelero completo
- [ ] Probar flujo cliente privado
- [ ] Probar admin (crear y editar expediente)
- [ ] Probar acceso /cliente/{hash} sin login
- [ ] Probar cambio de idioma
- [ ] Probar preguntas bloqueadas (cliente)

---

## NOTAS IMPORTANTES PARA CURSOR

1. **Fase 1 = Mock Completo**: TODO es simulado. Ningún backend real.
2. **Storage = localStorage**: No usar sesiones HTTP reales.
3. **Auth = Fake**: Cualquier email + password funciona.
4. **Respuestas = Templates**: Basadas en palabras clave, no LLM.
5. **Datos = Hardcoded**: Leyes y usuarios vienen de JSON.
6. **Próxima Fase**: Conectar Claude API real + base de datos.

---

**Documento creado**: Julio 2024  
**Versión**: 1.0  
**Estado**: Listo para desarrollo  

Preguntas o aclaraciones → Consultar con product owner.
