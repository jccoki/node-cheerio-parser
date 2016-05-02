var Promise = require("bluebird");
var cheerio = require('cheerio');

var join = Promise.join;
var fs = Promise.promisifyAll(require('fs'));

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you
var request = Promise.promisifyAll(require('request'));

var input_dir = "./input";
var output_dir = "./temp";

var dataPromises = []
var filePromises = []
var send_out_list = []
var fieldHeaders = ['name', 'company', 'address', 'phone', 'mobile', 'email'];

fs.readdirAsync(input_dir).map(function (filename) {
    return fs.readFileAsync(input_dir + "/" + filename, "utf8");
}).then(function (content) {

  var parsedHTML = cheerio.load(content.toString())
  parsedHTML('tr.result a').each(function(i, link) {
    var href = cheerio(link).attr('href')

    if (href.match('\/Account\/FindCpa\.mvc\/ViewAccount?accountId=[0-9a-z\-]*')) return
    //not all parse urls are available


    dataPromises.push(request.getAsync('https://www.cpaaustralia.com.au' + href))
  })

  return Promise.all(dataPromises).map(function(response){
    console.log('processing: ' + response.req.path)
    if(response.statusCode = 200){
      var name = response.req.path.replace('/Account/FindCpa.mvc/ViewAccount?accountId=', '').replace('/', '')

      //console.log(name)
      fs.writeFileAsync( output_dir + '/' + name, response.body, function(err) {
        if (err) throw err;
      });

//      fs.appendFileAsync('FPA Webscraped Data 160314.log', response.req.path + '\r\n', function(err) {
//        if (err) throw err;
//      });
    }
  })

})
