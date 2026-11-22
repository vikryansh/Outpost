/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        frontier: {
          950: '#030712',
          900: '#080d1a',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          ruby: '#ef4444',
          gold: '#eab308',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
        'neon-gold': '0 0 20px rgba(234, 179, 8, 0.6)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        'radar-sweep': 'radarSweep 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
