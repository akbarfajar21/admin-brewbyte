import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export const uploadImage = async (file: File, bucket: string, folder = '') => {
  const ext = file.name.split('.').pop()
  const fileName = `${folder ? folder + '/' : ''}${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}
