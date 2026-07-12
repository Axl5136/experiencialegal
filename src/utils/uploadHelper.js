const path = require('path')
const supabase = require('./supabase')

const ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'doc', 'docx']
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10)

const validateFile = (file) => {
  if (!file) return { valid: false, error: 'No file provided' }

  const ext = path.extname(file.originalname).toLowerCase().slice(1)

  if (!ALLOWED_TYPES.includes(ext)) {
    return { valid: false, error: `File type .${ext} not allowed` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}

const uploadToSupabase = async (file, expedienteId, userId, uploadedByRole) => {
  const ext = path.extname(file.originalname).toLowerCase()
  const filename = `${Date.now()}-${file.originalname}`
  const filePath = `expedientes/${expedienteId}/${uploadedByRole}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    })

  if (uploadError) throw uploadError

  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      expediente_id: expedienteId,
      filename: file.originalname,
      file_path: filePath,
      file_type: ext.slice(1),
      file_size: file.size,
      uploaded_by: userId,
      uploaded_by_role: uploadedByRole,
      tags: ['uploaded'],
    })
    .select()
    .single()

  if (dbError) throw dbError

  return { success: true, data }
}

module.exports = { validateFile, uploadToSupabase }
