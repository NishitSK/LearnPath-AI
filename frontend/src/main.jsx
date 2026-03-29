import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/uiSystem.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from "@clerk/themes";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const KEY_IS_VALID = PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_')

const MissingKeyError = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', background: '#050508',
    color: 'white', fontFamily: 'Manrope, sans-serif', textAlign: 'center', padding: '2rem'
  }}>
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: '12px', padding: '2rem 3rem', maxWidth: '500px'
    }}>
      <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>⚠️ Clerk Key Not Configured</h2>
      <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
        <code style={{ color: '#fca5a5' }}>VITE_CLERK_PUBLISHABLE_KEY</code> is missing or still set to the placeholder.
      </p>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
        Create a <code style={{ color: '#d1d5db' }}>.env</code> file in the
        <code style={{ color: '#d1d5db' }}> frontend/</code> folder and add your Clerk publishable key.
      </p>
      <pre style={{
        background: '#111', borderRadius: '8px', padding: '1rem',
        color: '#a78bfa', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'left'
      }}>{`VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here`}</pre>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {!KEY_IS_VALID ? (
      <MissingKeyError />
    ) : (
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        afterSignInUrl="/learning-plans?auth=login"
        afterSignUpUrl="/learning-plans?auth=login"
        afterSignOutUrl="/?auth=logout"
        appearance={{
          baseTheme: dark,
        }}>
        <App />
      </ClerkProvider>
    )}
  </React.StrictMode>,
)
