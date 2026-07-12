// Extiende seed-demo-data.js: más clientes asignados a los mismos abogados,
// con casos más variados. Mismo patrón idempotente (por descripcion+cliente_id).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const CLIENTES = [
  { email: 'miguel.reyes@example.com', nombre: 'Miguel Ángel Reyes Palacios' },
  { email: 'patricia.gomez@example.com', nombre: 'Patricia Gómez Landeros' },
  { email: 'alejandro.ruiz@example.com', nombre: 'Alejandro Ruiz Contreras' },
  { email: 'sofia.delgado@example.com', nombre: 'Sofía Delgado Marín' },
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
  const { data: abogados } = await supabase.from('users').select('*').eq('role', 'abogado')
  const ricardo = abogados.find((a) => a.email === 'ricardo.salazar@experiencialegal.com')
  const fernanda = abogados.find((a) => a.email === 'fernanda.ortiz@experiencialegal.com')
  if (!ricardo || !fernanda) {
    throw new Error('Corre primero scripts/seed-demo-data.js (crea a los abogados base)')
  }

  console.log('Creando/verificando clientes nuevos...')
  const clientes = []
  for (const c of CLIENTES) {
    const user = await getOrCreateUser({ ...c, role: 'cliente' })
    clientes.push(user)
    console.log(`  cliente: ${user.nombre} (${user.email}) -> ${user.id}`)
  }

  const numeroCounter = { value: null }

  const casos = [
    {
      cliente: clientes[0],
      abogado: ricardo,
      tipoCaso: 'laboral',
      estado: 'investigacion',
      fechaInicio: '2026-05-04',
      proximaAudiencia: '2026-09-22',
      descripcion: 'Reclamo por despido injustificado en empresa maquiladora',
      eventos: [
        { fecha: '2026-05-04', evento: 'Presentación de demanda ante Junta de Conciliación', visible_cliente: true },
        { fecha: '2026-05-20', evento: 'Notificación a la contraparte', visible_cliente: true },
        { fecha: '2026-06-02', evento: 'Recopilación de recibos de nómina y contrato', tipo: 'evento', visible_cliente: false },
      ],
    },
    {
      cliente: clientes[1],
      abogado: ricardo,
      tipoCaso: 'civil',
      estado: 'juicio',
      fechaInicio: '2025-08-11',
      proximaAudiencia: '2026-08-30',
      descripcion: 'Demanda por daños derivados de accidente automovilístico',
      eventos: [
        { fecha: '2025-08-11', evento: 'Presentación de demanda por daños y perjuicios', visible_cliente: true },
        { fecha: '2025-12-01', evento: 'Audiencia de conciliación (sin acuerdo)', visible_cliente: true },
        { fecha: '2026-03-15', evento: 'Admisión de pruebas periciales', visible_cliente: true },
      ],
    },
    {
      cliente: clientes[2],
      abogado: fernanda,
      tipoCaso: 'comercial',
      estado: 'investigacion',
      fechaInicio: '2026-06-01',
      proximaAudiencia: '2026-10-05',
      descripcion: 'Cobro de factura impaga a proveedor de insumos',
      eventos: [
        { fecha: '2026-06-01', evento: 'Recepción del caso y análisis documental', visible_cliente: true },
        { fecha: '2026-06-18', evento: 'Envío de requerimiento de pago extrajudicial', visible_cliente: true },
      ],
    },
    {
      cliente: clientes[3],
      abogado: fernanda,
      tipoCaso: 'penal',
      estado: 'sentencia',
      fechaInicio: '2024-11-20',
      proximaAudiencia: null,
      descripcion: 'Defensa en causa por robo sin violencia',
      eventos: [
        { fecha: '2024-11-20', evento: 'Audiencia inicial', visible_cliente: true },
        { fecha: '2025-04-09', evento: 'Audiencia de juicio oral', visible_cliente: true },
        { fecha: '2025-07-22', evento: 'Sentencia absolutoria', visible_cliente: true },
      ],
    },
  ]

  console.log('Creando/verificando expedientes nuevos...')
  const creados = []
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
    creados.push({ expediente, cliente: caso.cliente, abogado: caso.abogado })
  }

  console.log('\nListo.')
  require('fs').writeFileSync(
    require('path').join(__dirname, '.seed-2-output.json'),
    JSON.stringify(creados.map((c) => ({
      expedienteId: c.expediente.id,
      numero: c.expediente.numero,
      clienteEmail: c.cliente.email,
      clienteNombre: c.cliente.nombre,
      abogadoEmail: c.abogado.email,
    })), null, 2)
  )
}

main().catch((err) => {
  console.error('Error en seed:', err)
  process.exit(1)
})
