const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const urlParse = require('url').parse
const googconstTS = require('google-tts-api')


function downloadFile (url, dest) {
    return new Promise(function (resolve, reject) {
      var info = urlParse(url);
      var httpClient = info.protocol === 'https:' ? https : http;
      var options = {
        host: info.host,
        path: info.path,
        headers: {
          'user-agent': 'WHAT_EVER'
        }
      };
  
      httpClient.get(options, function(res) {
        // check status code
        if (res.statusCode !== 200) {
          reject(new Error('request to ' + url + ' failed, status code = ' + res.statusCode + ' (' + res.statusMessage + ')'));
          return;
        }
  
        var file = fs.createWriteStream(dest);
        file.on('finish', function() {
          // close() is async, call resolve after close completes.
          file.close(resolve(dest));
        });
        file.on('error', function (err) {
          // Delete the file async. (But we don't check the result)
          fs.unlink(dest);
          reject(err);
        });
  
        res.pipe(file);
      })
      .on('error', function(err) {
        reject(err);
      })
      .end();
    });
  }


module.exports.makeMP3FromText = (text, fileName = '' + Date.now(), lang = 'RU', speed = 1) => {
    googconstTS(text, lang, speed)
    .then(url => {
        const dest = path.resolve(__dirname, fileName + '.mp3')
        console.log(` (*) start download to ${dest} ...`)

        return downloadFile(url, dest)
    })
    .then(() => console.log(' (*) done!'))
    .catch(console.error)
}
