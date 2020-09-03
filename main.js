const fetch = require('node-fetch')
const https = require('https')
const fs = require('fs')
const JSDOM = require("jsdom").JSDOM
const parse = require('node-html-parser').parse
const makeMP3 = require('./TextToSpeech').makeMP3FromText

const getDataFromRozetka = async url => {
    const data = {}

    await fetch(`${url}`,{method: "get"})
    .then(res => res.text())
    .then(text => {
        const data = {}

        const domDocument = new JSDOM(text)

        data.title = domDocument.window.document.querySelector('.product__title').textContent
        data.description = domDocument.window.document.querySelector('.product-about__description-content').textContent
        data.characteristics = domDocument.window.document.querySelector('.product-about__characteristics').textContent
        
        const finalText = obsKeysToString(data)
        finalText.forEach(e => makeMP3(e))
        
        // const file = fs.createWriteStream(`./results/${counter++}_${id}.png`)
        // https.get(photo_url, response => response.pipe(file))
        // file.on('finish', () => file.close())
    })
}

const obsKeysToString =  obj => {
    let str = ''
    for (const key in obj) {
        str = str + obj[key] + '.'
    }

    return str.match(/.{1,199}/g)
}

getDataFromRozetka('https://rozetka.com.ua/202432753/p202432753/')