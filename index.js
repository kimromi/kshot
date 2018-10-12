const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const send = require('koa-send')
const puppeteer = require('puppeteer')
const ipaddr = require('ipaddr.js')

require('dotenv').config()

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = 'Hello KShot!'
})
router.get('/shot', async (ctx, next) => {

  if (typeof ctx.request.query.url === 'undefined') {
    ctx.body = 'please set parameter `url`.'
    return
  }

  let url = null
  try {
    url = new URL(ctx.request.query.url)

    // http or https only
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw 'invalid scheme'
    }
    // can't shot localhost
    if (/localhost|127\.0\.0\.1/.test(url.host)) {
      throw 'can not set localhost'
    }
    // can't shot private ip address
    if (ipaddr.IPv4.isValid(url.host) && ipaddr.IPv4.parse(url.host).range() === 'private') {
      throw 'can not set private ip address'
    }

  } catch (e) {
    console.error(e)
    ctx.body = 'Invalid URL'
    return
  }

  const file = `/tmp/${Math.random().toString(36).slice(-10)}.png`

  const launchOptions = { headless: true }
  if (process.env.CHROMIUM_PATH) {
    launchOptions.executablePath = process.env.CHROMIUM_PATH
  }
  if (process.env.CHROMIUM_NO_SANDBOX) {
    launchOptions.args = ['--no-sandbox', '--disable-setuid-sandbox']
  }
  const browser = await puppeteer.launch(launchOptions)
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'load' })
    await page.waitFor(3000)
    await page.screenshot({ path: file, fullPage: true })
    await send(ctx, file, { root: '/' })
    fs.unlinkSync(file)
  } catch (e) {
    ctx.body = 'Error!'
  } finally {
    await browser.close()
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(process.env.PORT || 80)
