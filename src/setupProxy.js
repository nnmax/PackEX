// @ts-check
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function setupProxy(
  /**
   * @type {import('express').Express}
   */
  app,
) {
  app.use(
    '/packex',
    createProxyMiddleware({
      target: process.env.API_ENDPOINT,
      changeOrigin: true,
    }),
  )
}
