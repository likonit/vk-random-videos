const puppeteer = require("puppeteer"), fs = require("fs"), express = require("express"), app = express(),
    path = require("path");

app.use(express.static(path.join(__dirname, "static")))
const server = app.listen(3000, () => {

    console.log('serer..')
})

const io = require("socket.io")(server)

io.on("connection", async (socket) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    async function getRandomVideo() {

      let possible = "qwertyuiopasdfghjklzxcvbnm0123456789", text = "";

      for (var i=0; i < 3; i++ )
          text += possible[Math.floor(Math.random() * (possible.length))];

      // console.log("Поиск по запросу: " + 'https://vk.com/video?q=' + text)
      
      await page.goto('https://vk.com/video?q=' + text, {waitUntil: [
        'load',
        'domcontentloaded',
        'networkidle2'
      ]});

      await page.waitForSelector(".ui_search_params_title", {
        visible: true
      })

      setTimeout(async () => {

        try {

          const o = await page.$$eval(".VideoCard__title", elms => 
          elms[Math.floor(Math.random() * elms.length)].getAttribute('href'))
          
          console.log(`[${text}] Результат: https://vk.com` + o)

          await page.goto('https://m.vk.com' + o, {waitUntil: [
            'load',
            'domcontentloaded',
          ], timeout: 5000});

          await page.waitForSelector("source", {
            timeout: 5000
          })

          var u = await page.$$eval("source", elms => 
          elms[2].getAttribute('src'))

          console.log(u)

          io.emit("new_video", {src: u, link: `https://vk.com` + o})
          getRandomVideo()

        } catch(e) {

            console.log('ОШИБКА')
            getRandomVideo()

        }

      }, 3000)

    }

    getRandomVideo()

    // await browser.close();

})
