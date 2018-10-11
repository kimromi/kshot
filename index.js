const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const send = require('koa-send')
const puppeteer = require('puppeteer')

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = 'Hello KShot!'
})
router.get('/shot', async (ctx, next) => {
  const url = ctx.request.query.url
  if (typeof url === 'undefined') {
    ctx.body = 'please set parameter `url`.'
    return
  }

  const file = '/tmp/shot.png'

  const launchOptions = { headless: true }
  // for heroku
  if (process.env.DYNO) {
    launchOptions.args = ['--no-sandbox', '--disable-setuid-sandbox']
  }
  const browser = await puppeteer.launch(launchOptions)
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'load' })
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
