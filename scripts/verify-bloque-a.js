require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const supabase = require('../src/utils/supabase')

async function main() {
  let ok = true

  const { error: chunksErr } = await supabase.from('document_chunks').select('id').limit(1)
  if (chunksErr) {
    console.log('❌ document_chunks:', chunksErr.message)
    ok = false
  } else {
    console.log('✅ Tabla document_chunks existe')
  }

  const { error: colsErr } = await supabase
    .from('documents')
    .select('processing_status, extracted_text_length')
    .limit(1)
  if (colsErr) {
    console.log('❌ columnas processing_status/extracted_text_length:', colsErr.message)
    ok = false
  } else {
    console.log('✅ documents tiene processing_status + extracted_text_length')
  }

  const dummyEmbedding = new Array(768).fill(0)
  const { error: rpcErr } = await supabase.rpc('match_document_chunks', {
    query_embedding: dummyEmbedding,
    match_expediente_id: '00000000-0000-0000-0000-000000000000',
    match_threshold: 0.5,
    match_count: 5,
  })
  if (rpcErr) {
    console.log('❌ función match_document_chunks:', rpcErr.message)
    ok = false
  } else {
    console.log('✅ Función match_document_chunks existe y responde')
  }

  console.log(ok ? '\n✅ BLOQUE A verificado completo' : '\n❌ BLOQUE A incompleto')
  process.exit(ok ? 0 : 1)
}

main()
