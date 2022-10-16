const axios = require('axios')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

function loop() {

    const pages = 3 // first 3 pages || 60 articles for about 2.767s
    // const pages = 50 // all 50 pages || 1000 articles for about 49.613s
    const result = []
    const urls = []
    const resultFile = `result-${pages}.json`

    fs.writeFileSync(resultFile, '')

    for (let currentPage = 1; currentPage <= pages; currentPage++) {
        urls.push(`https://habr.com/ru/search/page${currentPage}/?q=parsing&target_type=posts&order=relevance`)
    }

    function makeWrites(data) {
        fs.appendFile(resultFile, JSON.stringify(data, null, 4), function (err) {
            if (err) {
                console.log(err)
            }
        })
    }

    function fetchPage(url) {
        return axios.get(url)
            .then(res => {
                let raw = res.data
                const dom = new JSDOM(raw)
                const doc = dom.window.document
                const articlesArray = []

                let articles = doc.querySelectorAll('.tm-articles-list__item')

                articles.forEach(article => {
                    let title = article.querySelector('.tm-article-snippet__title span').textContent
                    let body = article.querySelector('.article-formatted-body').textContent
                    let link = 'https://habr.com' + article.querySelector('.tm-article-snippet__title a.tm-article-snippet__title-link').getAttribute('href')

                    let data = {
                        title,
                        body,
                        link
                    }

                    articlesArray.push(data)
                })

                return articlesArray
            })
    }

    let interval = 0
    urls.forEach((url, index) => {
        setTimeout(() => {
            fetchPage(url)
                .then(res => result.push(...res))
                .then(() => {
                    if (index === urls.length - 1) {
                        makeWrites(result)
                        console.timeEnd('loop')
                        console.log('Congrats! Parsing is done')
                        console.log(result.length)
                    }
                })
        }, interval)
        interval += 1000
    })

}

console.time('loop')
loop()

