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
        '.loading': {
          pointerEvents: 'none',
          display: 'inline-block',
          aspectRatio: '1 / 1',
          width: '1.5rem' /* 24px */,
          backgroundColor: 'currentColor',
          maskSize: '100%',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.spinner_qM83%7Banimation:spinner_8HQG 1.05s infinite%7D.spinner_oXPr%7Banimation-delay:.1s%7D.spinner_ZTLf%7Banimation-delay:.2s%7D@keyframes spinner_8HQG%7B0%25,57.14%25%7Banimation-timing-function:cubic-bezier(0.33,.66,.66,1);transform:translate(0)%7D28.57%25%7Banimation-timing-function:cubic-bezier(0.33,0,.66,.33);transform:translateY(-6px)%7D100%25%7Btransform:translate(0)%7D%7D%3C/style%3E%3Ccircle class='spinner_qM83' cx='4' cy='12' r='3'/%3E%3Ccircle class='spinner_qM83 spinner_oXPr' cx='12' cy='12' r='3'/%3E%3Ccircle class='spinner_qM83 spinner_ZTLf' cx='20' cy='12' r='3'/%3E%3C/svg%3E")`,
        },
      })
    }),
  ],
}
