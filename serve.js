const http = require('http')
const fs = require('fs')
const path = require('path')

const root = __dirname
const port = Number(process.env.PORT || 4173)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)
  const filePath = path.resolve(root, `.${pathname}`)

  if (!filePath.startsWith(root)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404)
      response.end('Not found')
      return
    }

    const extension = path.extname(filePath)
    const isStaticAsset = !['.html'].includes(extension)
    response.writeHead(200, {
      'Content-Type': types[extension] || 'application/octet-stream',
      'Cache-Control': isStaticAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    })
    response.end(data)
  })
})

server.listen(port, () => {
  console.log(`Preview running at http://localhost:${port}`)
})
