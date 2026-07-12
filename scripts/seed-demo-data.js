// Pobla la base real (vía REST de Supabase, no SQL directo) con clientes,
// abogados y expedientes de ejemplo para que las pantallas de admin y el
// buscador de clientes no dependan de un único registro de prueba.
// Idempotente: si un email/numero ya existe, lo reusa en vez de duplicar.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const CLIENTES = [
  { email: 'roberto.hernandez@example.com', nombre: 'Roberto Hernández Silva' },
  { email: 'ana.torres@example.com', nombre: 'Ana Lucía Torres Mendoza' },
  { email: 'fernando.castillo@example.com', nombre: 'Fernando Castillo Ruiz' },
  { email: 'diana.jimenez@example.com', nombre: 'Diana Paola Jiménez' },
]

const ABOGADOS = [
  { email: 'ricardo.salazar@experiencialegal.com', nombre: 'Lic. Ricardo Salazar Núñez' },
  { email: 'fernanda.ortiz@experiencialegal.com', nombre: 'Lic. Fernanda Ortiz Beltrán' },
]

async function getOrCreateUser({ email, nombre, role }) {
  const { data: existing } = await supabase.from('users').select('*').eq('email', email).single()
  if (existing) return existing

  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: await bcrypt.hash('demo123', 10),
      nombre,
      role,
      estado: 'activo',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function nextNumero(year, counterRef) {
  if (counterRef.value === null) {
    const { data } = await supabase
      .from('expedientes')
      .select('numero')
      .like('numero', `EXP-${year}%`)
      .order('numero', { ascending: false })
      .limit(1)
    counterRef.value = data && data.length > 0 ? parseInt(data[0].numero.split('-')[2], 10) : 0
  }
  counterRef.value += 1
  return `EXP-${year}-${String(counterRef.value).padStart(3, '0')}`
}

async function getOrCreateExpediente({ numeroCounter, clienteId, abogadoId, tipoCaso, estado, fechaInicio, proximaAudiencia, descripcion, eventos }) {
  const { data: existentes } = await supabase
    .from('expedientes')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('descripcion', descripcion)

  if (existentes && existentes.length > 0) return existentes[0]

  const year = new Date().getFullYear()
  const numero = await nextNumero(year, numeroCounter)
  const linkHash = crypto.randomBytes(16).toString('hex')

  const { data: expediente, error } = await supabase
    .from('expedientes')
    .insert({
      numero,
      cliente_id: clienteId,
      abogado_id: abogadoId,
      tipo_caso: tipoCaso,
      estado,
      fecha_inicio: fechaInicio,
      proxima_audiencia: proximaAudiencia,
      descripcion,
      link_hash: linkHash,
    })
    .select()
    .single()

  if (error) throw error

  for (const evento of eventos) {
    await supabase.from('cronologia').insert({
      expediente_id: expediente.id,
      fecha: evento.fecha,
      evento: evento.evento,
      tipo: evento.tipo || 'evento',
      visible_cliente: evento.visible_cliente ?? true,
      created_by: abogadoId,
    })
  }

  return expediente
}

async function main() {
  console.log('Creando/verificando clientes...')
  const clientes = []
  for (const c of CLIENTES) {
    const user = await getOrCreateUser({ ...c, role: 'cliente' })
    clientes.push(user)
    console.log(`  cliente: ${user.nombre} (${user.email}) -> ${user.id}`)
  }

  console.log('Creando/verificando abogados...')
  const abogados = []
  for (const a of ABOGADOS) {
    const user = await getOrCreateUser({ ...a, role: 'abogado' })
    abogados.push(user)
    console.log(`  abogado: ${user.nombre} (${user.email}) -> ${user.id}`)
  }

  const numeroCounter = { value: null }

  const casos = [
    {
      cliente: clientes[0],
      abogado: abogados[0],
      tipoCaso: 'civil',
      estado: 'juicio',
      fechaInicio: '2025-11-03',
      proximaAudiencia: '2026-08-14',
      descripcion: 'Controversia por incumplimiento de contrato de arrendamiento comercial',
      eventos: [
        { fecha: '2025-11-03', evento: 'Presentación de demanda inicial', visible_cliente: true },
        { fecha: '2026-01-20', evento: 'Audiencia preliminar celebrada', visible_cliente: true },
        { fecha: '2026-02-10', evento: 'Revisión interna de pruebas documentales', tipo: 'evento', visible_cliente: false },
      ],
    },
    {
      cliente: clientes[1],
      abogado: abogados[1],
      tipoCaso: 'penal',
      estado: 'investigacion',
      fechaInicio: '2026-03-18',
      proximaAudiencia: '2026-09-02',
      descripcion: 'Denuncia por fraude en compraventa de vehículo',
      eventos: [
        { fecha: '2026-03-18', evento: 'Presentación de denuncia ante el Ministerio Público', visible_cliente: true },
        { fecha: '2026-04-05', evento: 'Ratificación de denuncia', visible_cliente: true },
      ],
    },
    {
      cliente: clientes[2],
      abogado: abogados[0],
      tipoCaso: 'comercial',
      estado: 'sentencia',
      fechaInicio: '2024-09-12',
      proximaAudiencia: null,
      descripcion: 'Disputa societaria por reparto de utilidades',
      eventos: [
        { fecha: '2024-09-12', evento: 'Inicio del procedimiento arbitral', visible_cliente: true },
        { fecha: '2025-06-30', evento: 'Emisión de sentencia favorable', visible_cliente: true },
      ],
    },
    {
      cliente: clientes[3],
      abogado: abogados[1],
      tipoCaso: 'laboral',
      estado: 'cerrado',
      fechaInicio: '2024-02-01',
      proximaAudiencia: null,
      descripcion: 'Reclamación de finiquito y prestaciones no pagadas',
      eventos: [
        { fecha: '2024-02-01', evento: 'Presentación de demanda laboral', visible_cliente: true },
        { fecha: '2024-10-15', evento: 'Convenio de finiquito firmado por ambas partes', visible_cliente: true },
      ],
    },
  ]

  console.log('Creando/verificando expedientes...')
  for (const caso of casos) {
    const expediente = await getOrCreateExpediente({
      numeroCounter,
      clienteId: caso.cliente.id,
      abogadoId: caso.abogado.id,
      tipoCaso: caso.tipoCaso,
      estado: caso.estado,
      fechaInicio: caso.fechaInicio,
      proximaAudiencia: caso.proximaAudiencia,
      descripcion: caso.descripcion,
      eventos: caso.eventos,
    })
    console.log(`  expediente: ${expediente.numero} (${caso.cliente.nombre}, abogado ${caso.abogado.nombre}) hash=${expediente.link_hash}`)
  }

  console.log('\nListo.')
}

main().catch((err) => {
  console.error('Error en seed:', err)
  process.exit(1)
})
