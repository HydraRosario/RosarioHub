export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Hero Section */}
      <section style={{
        padding: '8rem 20px 6rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top, rgba(147, 51, 234, 0.4) 0%, transparent 60%)'
        }}></div>
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.5rem',
            padding: '8px 20px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3))',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#e9d5ff',
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Rosario, Argentina
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            marginBottom: '1.5rem', 
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            ROSARIO<span style={{ color: '#a855f7' }}>HUB</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.35rem)', 
            color: '#9ca3af', 
            marginBottom: '0',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            La plataforma de los músicos de Rosario.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '2rem 20px 8rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            padding: 'clamp(2rem, 5vw, 4rem)',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 35, 0.95))',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
              <h2 style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: 700, 
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #fff, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ¿Haces música en Rosario?
            </h2>
            <p style={{ 
              fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', 
              color: '#9ca3af', 
              marginBottom: '2.5rem',
              lineHeight: 1.6
            }}>
              Unite a RosarioHub y mostrá tus métricas en tiempo real.{' '}
              <span style={{ color: '#e9d5ff', fontWeight: 500 }}>
                Compite por ser el artista más escuchado del mes y gana una grabación + mezcla + mastering.
              </span>
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              <a 
                target="_blank"
                rel="noopener noreferrer"
                href="https://wa.me/5493417207642?text=Estuve%20viendo%20la%20p%C3%A1gina%20y%20me%20cop%C3%B3%20la%20movida%2C%20quiero%20sumarme%20a%20RosarioHub%21"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Unite Ahora
              </a>
              <a 
                href="/leaderboard" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '1rem',
                  transition: 'background 0.2s, border-color 0.2s'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
                Ver Rankings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.875rem', flexWrap: 'wrap', gap: '1rem' }}>
          <p>© 2026 RosarioHub</p>
          <p>La plataforma de los músicos rosarinos</p>
        </div>
      </footer>
    </div>
  )
}
