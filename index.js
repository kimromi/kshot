const Koa = require('koa')
const Router = require('koa-router')
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

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'load' })
    await page.screenshot({ path: '/tmp/shot.png', fullPage: true })
    ctx.body = 'OK!'
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
