// @ts-check
const animate = require('tailwindcss-animate')
const plugin = require('tailwindcss/plugin')
const { addDynamicIconSelectors } = require('@iconify/tailwind')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aaa: '#aaa',
        lemonYellow: '#ffc300',
      },
    },
  },
  plugins: [
    animate,
    addDynamicIconSelectors(),
    plugin(({ addUtilities, matchUtilities, theme }) => {
      matchUtilities(
        {
          'rhombus-bg': (value) => {
            return {
              '--rhombus-bg-color': value,
            }
          },
        },
        {
          values: theme('colors'),
        },
      )
      matchUtilities(
        {
          'rhombus-h': (value) => {
            return {
              '--rhombus-height': value,
            }
          },
          'rhombus-w': (value) => {
            return {
              '--rhombus-width': value,
            }
          },
          'rhombus-top': (value) => {
            return {
              '--rhombus-top': value,
            }
          },
          'rhombus-bottom': (value) => {
            return {
              '--rhombus-bottom': value,
            }
          },
        },
        {
          values: theme('spacing'),
          supportsNegativeValues: true,
        },
      )
      addUtilities({
        '.top-rhombus': {
          content: '""',
          position: 'absolute',
          height: 'var(--rhombus-height, 8px)',
          width: 'var(--rhombus-width, 50%)',
          left: '50%',
          top: 'var(--rhombus-top, 0)',
          transform: 'translateX(-50%)',
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 6px 100%)',
          backgroundColor: 'var(--rhombus-bg-color)',
        },
        '.bottom-rhombus': {
          content: '""',
          position: 'absolute',
          height: 'var(--rhombus-height, 8px)',
          width: 'var(--rhombus-width, 50%)',
          left: '50%',
          bottom: 'var(--rhombus-bottom, 0)',
          transform: 'translateX(-50%)',
          clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)',
          backgroundColor: 'var(--rhombus-bg-color)',
        },
        '.reset-input-number': {
          /* FireFox */
          '@supports not selector(: : -webkit-inner-spin-button)': {
            '-moz-appearance': 'textfield !important',
          },
          /* Chrome */
          '&::-webkit-inner-spin-button': {
            display: 'none',
          },
        },
      })
    }),
  ],
}
