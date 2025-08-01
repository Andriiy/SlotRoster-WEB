export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#000000'
        }}>
          SlotRoster
        </h1>
        <p style={{
          marginBottom: '2rem',
          color: '#666666'
        }}>
          Flight Club Management Platform
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <a 
            href="/sign-in" 
            style={{
              display: 'inline-block',
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Sign In
          </a>
          <a 
            href="/sign-up" 
            style={{
              display: 'inline-block',
              backgroundColor: '#f3f4f6',
              color: '#000000',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
} 