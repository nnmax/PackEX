// @ts-check
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function setupProxy(
  /**
   * @type {import('express').Express}
   */
  app,
) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.API_ENDPOINT,
      changeOrigin: true,
    }),
  )
}
