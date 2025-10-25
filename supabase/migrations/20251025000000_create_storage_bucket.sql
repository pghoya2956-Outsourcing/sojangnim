-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket
CREATE POLICY "Public Access for product-images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product-images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product-images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product-images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images');
