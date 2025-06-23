module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  purge: [],
  darkMode: false, 
  theme: {
    extend: {
      colors: {
        
        
        
        
        
      },
      keyframes: {
        
        gentlePulse: {
          '0%, 100%': { opacity: '0.6' }, 
          '50%': { opacity: '0.9' },   
        },
        
        gentlePulseAlt: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.45' },
        },
        
        slowFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        
        slowDrift: {
            '0%': { transform: 'translate(0px, 0px) rotate(45deg)' }, 
            '50%': { transform: 'translate(15px, -10px) rotate(40deg)' },
            '100%': { transform: 'translate(0px, 0px) rotate(45deg)' },
        }
      },
      animation: {
        'gentle-pulse-1': 'gentlePulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
        'gentle-pulse-2': 'gentlePulseAlt 10s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
        'slow-float': 'slowFloat 12s ease-in-out infinite alternate',
        'slow-drift': 'slowDrift 15s ease-in-out infinite alternate',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
