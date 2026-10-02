import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import chatHandler from './api/chat.js'

// Load environment variables from .env for local development
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-chat-dev-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/chat' || req.url?.startsWith('/api/chat?')) {
            let bodyStr = ''
            req.on('data', (chunk) => {
              bodyStr += chunk
            })
            req.on('end', async () => {
              try {
                req.body = bodyStr ? JSON.parse(bodyStr) : {}
              } catch {
                req.body = {}
              }

              // Polyfill helper methods for res if needed
              if (!res.status) {
                res.status = (code) => {
                  res.statusCode = code
                  return res
                }
              }
              if (!res.json) {
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                  return res
                }
              }

              try {
                await chatHandler(req, res)
              } catch (err) {
                console.error('Dev Server API error:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message }))
              }
            })
            return
          }
          next()
        })
      },
    },
  ],
})
