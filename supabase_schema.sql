-- Script SQL para inicializar Supabase
-- Copia y pega esto en el SQL Editor de tu Dashboard de Supabase

-- 1. Tabla de Artistas
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    theme TEXT NOT NULL DEFAULT 'SOFT_TRAP',
    
    spotify_artist_id TEXT,
    youtube_channel_id TEXT,
    instagram_handle TEXT,
    
    spotify_listeners BIGINT DEFAULT 0,
    youtube_subs BIGINT DEFAULT 0,
    instagram_followers BIGINT DEFAULT 0,
    relevance_score NUMERIC(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS (Row Level Security) para habilitar lectura pública
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de artistas activos (para los subdominios)
CREATE POLICY "Permitir lectura publica de artistas activos" 
ON public.artists FOR SELECT USING (
    status = 'active'
);

-- Para desarrollo/demo (Admin), permitir todo acceso a artistas desde el Factory:
CREATE POLICY "Permitir acceso total a todos los usuarios autenticados o factory"
ON public.artists FOR ALL USING (true);
