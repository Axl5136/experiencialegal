// Genera PDFs realistas para cada expediente creado por seed-demo-data-2.js y
// los sube por la API real (como el abogado asignado) para que pasen por el
// pipeline RAG normal (extracción -> chunking -> embeddings).
//
// IMPORTANTE: los PDFs se generan con `cupsfilter` (motor nativo de macOS), NO con
// pdfkit. Un PDF generado con pdfkit es byte-identico en local/produccion pero
// pdf-parse@1.1.1 lo revienta con "bad XRef entry" solo dentro del runtime de
// Vercel (probablemente por una diferencia de version de Node vs local); un PDF
// "impreso" via CoreGraphics (cupsfilter/textutil/Chrome) no tiene ese problema.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const API_URL = process.env.SEED_API_URL || 'https://experiencialegal-backend.vercel.app/api'
const OUT_DIR = path.join(__dirname, '.demo-pdfs')

const casos = JSON.parse(fs.readFileSync(path.join(__dirname, '.seed-2-output.json'), 'utf-8'))

const CONTENIDO = {
  'EXP-2026-009': {
    titulo: 'Demanda Laboral por Despido Injustificado',
    filename: 'demanda-laboral-reyes.pdf',
    parrafos: [
      'JUNTA LOCAL DE CONCILIACIÓN Y ARBITRAJE DE LA CIUDAD DE MÉXICO',
      'ASUNTO: Demanda laboral por despido injustificado',
      'ACTOR: Miguel Ángel Reyes Palacios',
      'DEMANDADO: Manufacturas del Valle, S.A. de C.V.',
      '',
      'El actor Miguel Ángel Reyes Palacios prestó sus servicios para la demandada desde el 3 de enero de 2022, desempeñando el puesto de Supervisor de Línea de Producción, con un salario diario de $850.00 MXN.',
      'El día 28 de abril de 2026 fue despedido de forma verbal, sin causa justificada ni aviso de rescisión por escrito, en contravención al artículo 47 de la Ley Federal del Trabajo.',
      'Se solicita el pago de indemnización constitucional de 3 meses de salario, 20 días por año de servicio, prima de antigüedad, aguinaldo y vacaciones proporcionales, así como salarios caídos desde la fecha del despido.',
      'Se ofrecen como pruebas: contrato individual de trabajo, recibos de nómina de los últimos 12 meses, y testimoniales de dos compañeros de trabajo presentes al momento del despido.',
    ],
  },
  'EXP-2026-010': {
    titulo: 'Demanda Civil por Daños y Perjuicios',
    filename: 'demanda-civil-gomez.pdf',
    parrafos: [
      'JUZGADO CIVIL DE PRIMERA INSTANCIA - CIUDAD DE MÉXICO',
      'ASUNTO: Juicio ordinario civil por daños y perjuicios',
      'ACTORA: Patricia Gómez Landeros',
      'DEMANDADO: Roberto Alcántara Vega',
      '',
      'El día 15 de julio de 2025, aproximadamente a las 18:40 horas, sobre Avenida Insurgentes Sur, el vehículo conducido por el demandado impactó por alcance al vehículo de la actora, ocasionando daños materiales por un monto estimado de $87,500.00 MXN según dictamen pericial en materia de valuación de daños.',
      'Se acompaña parte de tránsito levantado por autoridad competente, en el que se hace constar que el demandado circulaba a exceso de velocidad y no guardó la distancia de seguridad reglamentaria.',
      'Se demanda el pago de los daños materiales acreditados, así como el pago de gastos médicos derivados de whiplash cervical diagnosticado a la actora, por la cantidad de $22,300.00 MXN.',
      'PRUEBAS: parte de tránsito oficial, dictamen pericial de valuación de daños, facturas de reparación del vehículo, y expediente clínico.',
    ],
  },
  'EXP-2026-011': {
    titulo: 'Requerimiento de Pago - Cobro Mercantil',
    filename: 'cobro-mercantil-ruiz.pdf',
    parrafos: [
      'ASUNTO: Cobro mercantil de factura vencida',
      'ACREEDOR: Alejandro Ruiz Contreras (Insumos Industriales del Centro)',
      'DEUDOR: Distribuidora Hermanos Paredes, S. de R.L. de C.V.',
      '',
      'Con fecha 3 de marzo de 2026 se emitió la factura folio F-0452 por concepto de venta de insumos industriales, por un monto total de $146,800.00 MXN con IVA incluido, pactándose fecha de vencimiento el 3 de mayo de 2026.',
      'A la fecha del presente escrito, el deudor no ha realizado pago alguno, a pesar de dos requerimientos extrajudiciales enviados el 20 de mayo y el 10 de junio de 2026, mismos que obran acuse de recibido.',
      'Se solicita el pago del adeudo principal más los intereses moratorios pactados en la orden de compra (2% mensual), así como los gastos y costas que se generen con motivo del presente procedimiento.',
      'PRUEBAS: factura F-0452, orden de compra firmada, acuses de recibido de los requerimientos extrajudiciales, estado de cuenta bancario.',
    ],
  },
  'EXP-2026-012': {
    titulo: 'Sentencia Absolutoria',
    filename: 'sentencia-delgado.pdf',
    parrafos: [
      'JUZGADO PENAL DE JUICIO ORAL - CIUDAD DE MÉXICO',
      'ASUNTO: Sentencia definitiva',
      'IMPUTADA: Sofía Delgado Marín',
      'DELITO: Robo sin violencia (artículo 220 del Código Penal para el Distrito Federal)',
      '',
      'Tras el desahogo de la audiencia de juicio oral celebrada el 9 de abril de 2025, y valoradas las pruebas ofrecidas por ambas partes conforme a las reglas de la sana crítica, este juzgado determina que el Ministerio Público no logró acreditar fehacientemente la participación de la imputada en los hechos que se le atribuyen.',
      'En consecuencia, se declara a Sofía Delgado Marín ABSUELTA de toda responsabilidad penal respecto del delito de robo sin violencia que le fue imputado, ordenándose el cese inmediato de cualquier medida cautelar vigente y la cancelación de sus antecedentes penales relacionados con esta causa.',
      'La presente resolución causó ejecutoria el 22 de julio de 2025, al no haberse interpuesto recurso alguno dentro del plazo legal establecido.',
    ],
  },
}

async function generarPdf({ titulo, parrafos }, outPath) {
  const encabezado = 'EXPERIENCIA LEGAL · Despacho Jurídico CDMX'
  const cuerpo = [encabezado, '', titulo.toUpperCase(), '', ...parrafos].join('\n\n')

  const txtPath = outPath.replace(/\.pdf$/, '.txt')
  fs.writeFileSync(txtPath, cuerpo, 'utf-8')

  const pdfBuffer = execFileSync('cupsfilter', [txtPath], { maxBuffer: 20 * 1024 * 1024 })
  fs.writeFileSync(outPath, pdfBuffer)
  fs.unlinkSync(txtPath)
}

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`Login falló para ${email}: ${res.status}`)
  const data = await res.json()
  return data.token
}

async function uploadDoc(token, expedienteId, filePath, filename) {
  const buffer = fs.readFileSync(filePath)
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: 'application/pdf' }), filename)

  const res = await fetch(`${API_URL}/documentos/${expedienteId}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Upload falló (${res.status}): ${JSON.stringify(data)}`)
  return data
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const tokenCache = {}
  for (const caso of casos) {
    const contenido = CONTENIDO[caso.numero]
    if (!contenido) {
      console.log(`  (sin contenido definido para ${caso.numero}, se omite)`)
      continue
    }

    const outPath = path.join(OUT_DIR, contenido.filename)
    await generarPdf(contenido, outPath)
    console.log(`  PDF generado: ${contenido.filename}`)

    // El login real solo acepta las 4 cuentas demo hardcodeadas en authController.js;
    // ricardo.salazar/fernanda.ortiz (sembrados via seed-demo-data-2.js) no pueden loguearse.
    // Subimos como maria@experiencialegal.com (abogado/admin puede subir a cualquier expediente).
    const LAWYER_LOGIN = 'maria@experiencialegal.com'
    if (!tokenCache[LAWYER_LOGIN]) {
      tokenCache[LAWYER_LOGIN] = await login(LAWYER_LOGIN, 'demo123')
    }
    const token = tokenCache[LAWYER_LOGIN]

    const result = await uploadDoc(token, caso.expedienteId, outPath, contenido.filename)
    console.log(`  subido a ${caso.numero} (${caso.clienteNombre}): documento id ${result.id || result.document?.id || '(ver respuesta)'}`)
  }

  console.log('\nListo. Esperando ~15s a que el pipeline RAG procese los documentos...')
  await new Promise((r) => setTimeout(r, 15000))
  console.log('Listo.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
