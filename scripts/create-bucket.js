require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET
  const { data: existing, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('Error listando buckets:', listError.message)
    process.exit(1)
  }

  if (existing.some((b) => b.name === bucketName)) {
    console.log(`Bucket "${bucketName}" ya existe.`)
    return
  }

  const { error } = await supabase.storage.createBucket(bucketName, { public: false })

  if (error) {
    console.error('Error creando bucket:', error.message)
    process.exit(1)
  }

  console.log(`Bucket "${bucketName}" creado correctamente (privado).`)
}

main()
