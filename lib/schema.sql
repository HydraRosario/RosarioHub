-- Tabla principal de artistas
CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  artist_id VARCHAR(100),
  spotify_url TEXT,
  youtube_channel_id TEXT,
  ig_handle TEXT,
  tiktok_handle TEXT,
  theme_id VARCHAR(50) NOT NULL DEFAULT 'SOFT_TRAP',
  active_status BOOLEAN DEFAULT true,
  relevance_score DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Snapshots horarios para analytics
CREATE TABLE metric_snapshots (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  metric_key VARCHAR(50) NOT NULL,
  raw_value BIGINT,
  formatted_value VARCHAR(20),
  relevance_weight DECIMAL(3,2),
  calculated_score DECIMAL(15,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Datos históricos procesados para leaderboards
CREATE TABLE historical_data (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_relevance_score DECIMAL(15,2),
  top_platform VARCHAR(20),
  growth_rate DECIMAL(5,2),
  milestone_achievements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_artists_active ON artists(active_status);
CREATE INDEX idx_metric_snapshots_artist_id ON metric_snapshots(artist_id);
CREATE INDEX idx_metric_snapshots_timestamp ON metric_snapshots(timestamp);
CREATE INDEX idx_historical_data_artist_date ON historical_data(artist_id, date);

-- Row Level Security (RLS) para futura escalabilidad
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_data ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (temporalmente abiertas para desarrollo)
CREATE POLICY "Enable read access for all users" ON artists FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON artists FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON artists FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON metric_snapshots FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON metric_snapshots FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON historical_data FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON historical_data FOR INSERT WITH CHECK (true);
