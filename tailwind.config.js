/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        'dark-bg': '#0a0a0a',
        'dark-surface': '#1a1a1a',
        'dark-card': '#2a2a2a',
        'dark-border': '#3a3a3a',
        'dark-text': '#ffffff',
        'dark-text-secondary': '#a0a0a0',
        'dark-text-muted': '#666666',
        
        // Glassmorphic colors
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        
        // Brand colors
        'campus-green': '#34A853',
        'campus-green-hover': '#2E7D32',
        'campus-green-light': 'rgba(52, 168, 83, 0.1)',
        
        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'body': '16px',
        'h1': '32px',
        'h2': '28px',
        'h3': '24px',
        'h4': '20px',
      },
      lineHeight: {
        'body': '1.5',
        'heading': '1.3',
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      borderRadius: {
        'glass': '16px',
        'component': '12px',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 0 20px rgba(52, 168, 83, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(52, 168, 83, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(52, 168, 83, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};