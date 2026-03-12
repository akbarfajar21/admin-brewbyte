import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { uploadImage } from '../lib/supabase'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket: string
  folder?: string
  label?: string
}

export default function ImageUpload({ value, onChange, bucket, folder, label = 'Upload Gambar' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5MB.'); return }
    setError('')
    setLoading(true)
    try {
      const url = await uploadImage(file, bucket, folder)
      onChange(url)
    } catch (err: any) {
      setError(err.message || 'Gagal upload gambar.')
    }
    setLoading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: '#6b6b60' }}>{label}</label>}

      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" style={{ border: '1px solid #2a2a26' }} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <button
              type="button"
              onClick={() => { onChange(''); inputRef.current?.click() }}
              className="btn-primary text-xs"
            >
              <Upload size={12} /> Ganti Gambar
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="btn-danger text-xs ml-2"
            >
              <X size={12} /> Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex flex-col items-center justify-center h-40 cursor-pointer transition-colors"
          style={{ border: '1.5px dashed #2a2a26', background: '#0f0f0d' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#D4AF37')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a26')}
        >
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
              <p className="text-xs" style={{ color: '#6b6b60' }}>Mengupload...</p>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon size={24} className="mx-auto mb-2" style={{ color: '#6b6b60' }} />
              <p className="text-xs font-medium" style={{ color: '#c8c8c0' }}>Klik atau drag gambar ke sini</p>
              <p className="text-xs mt-1" style={{ color: '#6b6b60' }}>PNG, JPG, WEBP (maks. 5MB)</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
