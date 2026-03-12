-- =====================================================
-- BREWBYTE ADMIN PANEL - SUPABASE SETUP SQL
-- Jalankan query ini di Supabase SQL Editor
-- =====================================================

-- 1. Tambah kolom 'role' ke tabel profiles (jika belum ada)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Set akun admin (ganti email dengan email akun admin kamu)
-- Jalankan ini SETELAH user mendaftar di auth.users
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'akbarfajar2112@gmail.com'
);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Buat bucket untuk gambar produk
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Buat bucket untuk gambar artikel
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Buat bucket untuk avatar profil
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE RLS POLICIES - product-images
-- =====================================================

-- Siapa saja bisa membaca gambar produk (public)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Hanya admin yang bisa upload/update/delete
CREATE POLICY "Admins can insert product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- STORAGE RLS POLICIES - article-images
-- =====================================================

CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Admins can insert article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- STORAGE RLS POLICIES - avatars
-- =====================================================

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

-- =====================================================
-- TABLE RLS - Pastikan admin bisa akses semua tabel
-- =====================================================

-- Policies untuk tabel orders (admin bisa lihat & update semua)
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR auth.uid() = user_id
);

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policies untuk tabel profiles (admin bisa lihat semua)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
  OR auth.uid() = id
);

-- Policies untuk products (admin CRUD)
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Public can view available products"
ON products FOR SELECT
USING (is_available = true);

-- Policies untuk categories (admin CRUD)
CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Public can view categories"
ON categories FOR SELECT
USING (true);

-- Policies untuk articles (admin CRUD)
CREATE POLICY "Admins can manage articles"
ON articles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Public can view articles"
ON articles FOR SELECT
USING (true);

-- Policies untuk product_reviews (admin DELETE)
CREATE POLICY "Admins can delete reviews"
ON product_reviews FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR auth.uid() = user_id
);

-- Policies untuk contact_messages (admin manage)
CREATE POLICY "Admins can manage contact messages"
ON contact_messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policies untuk contact_inquiries (admin manage)
CREATE POLICY "Admins can manage contact inquiries"
ON contact_inquiries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- TAMBAH KOLOM is_read ke contact_messages (jika belum ada)
-- =====================================================
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- =====================================================
-- VERIFIKASI SETUP
-- =====================================================

-- Cek apakah admin sudah ter-set dengan benar:
-- SELECT id, email FROM auth.users WHERE email = 'akbarfajar2112@gmail.com';
-- SELECT id, name, role FROM profiles WHERE role = 'admin';

-- Cek buckets:
-- SELECT * FROM storage.buckets;
