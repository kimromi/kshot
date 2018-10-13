const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const send = require('koa-send')
const puppeteer = require('puppeteer')
const URL = require('url')
const ipaddr = require('ipaddr.js')

require('dotenv').config()

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = "Hello KShot!\nExample: https://kshot.herokuapp.com/shot?url=http://example.com"
})

router.get('/shot', async (ctx, next) => {
  if (typeof ctx.request.query.url === 'undefined') {
    return ctx.throw(400, 'please set parameter `url`')
  }

  let url = null
  try {
    url = URL.parse(ctx.request.query.url, true)

    // http or https only
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw 'invalid scheme'
    }
    // can't shot localhost
    if (/^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      throw 'can not set localhost'
    }
    // can't shot private ip address
    if (ipaddr.IPv4.isValid(url.host) && ipaddr.IPv4.parse(url.host).range() === 'private') {
      throw 'can not set private ip address'
    }

  } catch (e) {
    console.error(e)
    return ctx.throw(400, 'Invalid URL')
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
    await page.goto(url.href, { waitUntil: 'domcontentloaded' })
    const wait = parseInt(ctx.request.query.wait)
    if (!!wait && 0 < wait && wait <= 5000) {
      await page.waitFor(wait)
    }
    await page.screenshot({ path: file, fullPage: true })
    await send(ctx, file, { root: '/' })
    fs.unlinkSync(file)
  } catch (e) {
    console.error(e)
    return ctx.throw(400, 'take screenhot error')
  } finally {
    await browser.close()
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(process.env.PORT || 80)
