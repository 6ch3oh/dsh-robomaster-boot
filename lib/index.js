/**
 * Host half of dsh-robomaster-boot.
 *
 * 1. Injects a parser-blocking first-frame dark-amber cover via `webserver/index-inject`
 *    so DSH's native `[data-dsh-boot]` loading card never flashes before the client
 *    plugin bundle evaluates.
 * 2. Registers an HTTP prefix route (`/robomaster-boot/*`) on `ctx.webServer`
 *    serving both the interactive 60fps HTML5 Canvas stage (`stage.html`) and
 *    the 1080P 60fps hardware-accelerated MP4 stream (`boot.mp4`) with full
 *    HTTP 206 Partial Content Range support.
 */

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { extname, resolve, sep, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = "boot-robomaster"

const MODE_KEY = "dsh-rm-boot:mode"
const DEFAULT_MODE = "off"
const FIRST_FRAME_CLASS = "dshrm-official-first"
const FIRST_FRAME_GLOBAL = "__dshRmOfficialFirstFrame"
const VERSION_GLOBAL = "__dshRmOfficialVersion"
const FIRST_FRAME_BG = '#050403'
const FIRST_FRAME_MAX_MS = 12000
const FIRST_FRAME_Z = 2147482000

const ROUTE_PREFIX = "/robomaster-boot"
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS_ROOT = resolve(PKG_ROOT, 'assets')

function packageVersion() {
  try {
    const url = new URL('../package.json', import.meta.url)
    return JSON.parse(readFileSync(url, 'utf8')).version ?? '1.0.0'
  } catch {
    return '1.0.0'
  }
}

const VERSION = packageVersion()

const FIRST_FRAME_CSS =
  'html.' + FIRST_FRAME_CLASS + '::before{content:"";position:fixed;inset:0;background:' +
  FIRST_FRAME_BG +
  ';z-index:' +
  String(FIRST_FRAME_Z) +
  ';pointer-events:none}\n' +
  'html.' + FIRST_FRAME_CLASS + '{background:' +
  FIRST_FRAME_BG +
  ';--dsw-specific-sidebar-fill:#141008;--dsw-alias-label-primary:#e8a020}'

const FIRST_FRAME_SCRIPT =
  '(function(){' +
  'var mode=null;' +
  'try{mode=window.localStorage.getItem(' + JSON.stringify(MODE_KEY) + ')}catch(e){}' +
  'if(mode===null||mode==="")mode=' + JSON.stringify(DEFAULT_MODE) + ';' +
  'if(mode==="off")return;' +
  'try{window.localStorage.setItem("dsh-550c-boot:mode","off");if(window.__dsh550cFirstFrame&&window.__dsh550cFirstFrame.end)window.__dsh550cFirstFrame.end()}catch(e){}' +
  'var root=document.documentElement;' +
  'var watch=null;' +
  'var end=function(){' +
  'if(watch!==null){window.clearInterval(watch);watch=null}' +
  'root.classList.remove(' + JSON.stringify(FIRST_FRAME_CLASS) + ')' +
  '};' +
  'window.' + FIRST_FRAME_GLOBAL + '={end:end};' +
  'root.classList.add(' + JSON.stringify(FIRST_FRAME_CLASS) + ');' +
  'var seen=false;' +
  'watch=window.setInterval(function(){' +
  'var card=document.querySelector("[data-dsh-boot]");' +
  'if(card===null){if(seen)end();return}' +
  'seen=true;' +
  'if(card.querySelector("[data-dsh-boot-spinner]")===null)end()' +
  '},250);' +
  'window.setTimeout(end,' + String(FIRST_FRAME_MAX_MS) + ');' +
  '})()'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
}

function parseRange(header, size) {
  if (typeof header !== 'string') return undefined
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (match === null) return undefined
  const [, rawStart, rawEnd] = match
  if (rawStart === '' && rawEnd === '') return undefined
  if (rawStart === '') {
    const length = Number(rawEnd)
    if (!Number.isFinite(length) || length <= 0) return undefined
    return { start: Math.max(size - length, 0), end: size - 1 }
  }
  const start = Number(rawStart)
  if (!Number.isFinite(start) || start >= size) return { unsatisfiable: true }
  const end = rawEnd === '' ? size - 1 : Math.min(Number(rawEnd), size - 1)
  if (!Number.isFinite(end) || end < start) return { unsatisfiable: true }
  return { start, end }
}

function assetHandler(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const clean = decodeURIComponent(url.pathname.slice(ROUTE_PREFIX.length)).replace(/^\/+/, '')
  const rel = clean === '' ? 'stage.html' : clean
  const file = resolve(ASSETS_ROOT, rel)

  if (!file.startsWith(resolve(ASSETS_ROOT) + sep) || !existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('not found')
    return
  }

  try {
    const info = statSync(file)
    const ext = extname(file).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

    if (ext === '.mp4') {
      const range = parseRange(req.headers.range, info.size)
      if (range?.unsatisfiable === true) {
        res.writeHead(416, { 'content-range': `bytes */${String(info.size)}` })
        res.end()
        return
      }
      const from = range === undefined ? 0 : range.start
      const to = range === undefined ? info.size - 1 : range.end
      res.writeHead(range === undefined ? 200 : 206, {
        'content-type': contentType,
        'accept-ranges': 'bytes',
        'cache-control': 'no-store',
        'content-length': String(to - from + 1),
        ...(range === undefined ? {} : {
          'content-range': `bytes ${String(from)}-${String(to)}/${String(info.size)}`,
        }),
      })
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      const stream = createReadStream(file, { start: from, end: to })
      stream.on('error', () => res.destroy())
      res.on('close', () => stream.destroy())
      stream.pipe(res)
      return
    }

    const body = readFileSync(file)
    res.writeHead(200, {
      'content-type': contentType,
      'content-length': String(body.byteLength),
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('internal error')
  }
}

export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: FIRST_FRAME_CSS })
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
    if (VERSION !== null) table.push({ kind: 'global', name: VERSION_GLOBAL, value: VERSION })
  })

  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => {
        try {
          return webCtx.webServer.register({
            kind: 'prefix',
            path: ROUTE_PREFIX,
            handler: assetHandler,
          })
        } catch (error) {
          console.error('[dsh-robomaster-boot] route registration failed', error)
          return () => {}
        }
      },
      `boot-robomaster: GET ${ROUTE_PREFIX}/*`,
    )
  })
}
