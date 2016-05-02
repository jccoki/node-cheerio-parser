var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');

var join = Promise.join;
var fs = Promise.promisifyAll(require('fs'));

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you
var request = Promise.promisifyAll(require('request'));

var directory = "./sites";

var dataPromises = []
var filePromises = []
var send_out_list = []
var fieldHeaders = ['name', 'company', 'address', 'phone', 'mobile', 'email'];

function decode(hash){
  var a = hash
  for(e='',r='0x'+a.substr(0,2)|0,n=2;a.length-n;n+=2)
    e+='%'+('0'+('0x'+a.substr(n,2)^r).toString(16)).slice(-2);
  return decodeURIComponent(e)
}

fs.readdirAsync(directory).map(function (filename) {
    return fs.readFileAsync(directory + "/" + filename, "utf8");
}).then(function (content) {

//  console.log('content:\n\n' + content)
  var parsedHTML = cheerio.load(content.toString())
  parsedHTML('h6 a').each(function(i, link) {
    var href = cheerio(link).attr('href')

    if (href.match('/\/find\-a\-planner\/[a-zA-Z0-9\-]+\/')) return
    //not all parse urls are available

    dataPromises.push(request.getAsync(href))
  })

  return Promise.all(dataPromises).map(function(response){
    if(response.statusCode = 200){
      var name = response.req.path.replace('/find-a-planner/', '').replace('/', '')

      //console.log(name)
      fs.writeFileAsync('./temp/' + name, response.body, function(err) {
        if (err) throw err;
      });

      fs.appendFileAsync('FPA Webscraped Data 160314.log', response.req.path + '\r\n', function(err) {
        if (err) throw err;
      });
    }
  }).then(function(responses){
    fs.readdirAsync("./temp").map(function (filename) {
        fs.readFileAsync("./temp/" + filename, "utf8").then(function (content) {
           var parsedURL = cheerio.load(content.toString())
            var json_data = {}

            // insome instances, webpage is save sucessfully and sometimes it is not
            // possible race condition problem
            try{
              if(cheerio.load(parsedURL('#member-details').html())){
                var parsedTable = cheerio.load(parsedURL('#member-details').html())
                parsedTable('tr').each(function(index, row){
                  var header = cheerio(row).children().first().html()
                  var key = cheerio.load( header )('strong').html()
                  var val = cheerio(row).children().eq(1).html()

                  key = key.toLowerCase()
                  if(key == 'email'){

                    if(cheerio.load(val)('span').attr('data-cfemail')){
                      val = decode(cheerio.load(val)('span').attr('data-cfemail'))
                    }
                  }
                  if(key == 'website'){
                    val = cheerio.load(val)('a').attr('href')
                  }
                  if(key == 'name'){
                    val = val.replace('AFP<sup>&#xAE;</sup>', '')
                    val = val.replace('CFP<sup>&#xAE;</sup>', '')
                    val = val.replace('AEPS<sup>&#xAE;</sup>', '')
                    val = val.replace('LRS<sup>&#xAE;</sup>', '')
                  }
                  if(key == 'address'){
                    val = val.replace('<br>', ',').trim()
                  }

                  // fields without values are nt written to csv
                  if(!val){
                    val = ' '
                  }

                  json_data[key] = val
                })
              }
            }catch(e){
              console.log('error => ' + e)
            }
    //        send_out_list.push(json_data)
            json2csv({ data: json_data, fields: fieldHeaders }, function(err, csv) {
              if (err) console.log(err);
              //console.log('written: ' + csv)
              fs.appendFile('FPA Webscraped Data 160314.csv', csv, function(err) {
                if (err) throw err;
                //console.log('entry saved: ' + JSON.stringify(json_data));
              });
            });
        })
      })
  })
})
