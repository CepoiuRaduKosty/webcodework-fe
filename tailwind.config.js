module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // Your existing palette colors if you defined them here
        // 'palette-lightest': '#F9F7F7',
        // 'palette-light-accent': '#DBE2EF',
        // 'palette-primary': '#3F72AF',
        // 'palette-darkest': '#112D4E',
      },
      keyframes: {
        // A gentle opacity pulse
        gentlePulse: {
          '0%, 100%': { opacity: '0.6' }, // Mid-opacity
          '50%': { opacity: '0.9' },   // Slightly more opaque
        },
        // Another variation for a different element
        gentlePulseAlt: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.45' },
        },
        // Slow floating up and down
        slowFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        // Slow diagonal drift
        slowDrift: {
            '0%': { transform: 'translate(0px, 0px) rotate(45deg)' }, // Keep original rotation
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
