var fs = require('fs');
var bl = require('bl')
var http = require("http");

var json2csv = require('json2csv');
var cheerio = require('cheerio')
var request = require('request')

var URLs = []

var send_out_list = []

var fieldHeaders = ['name', 'company', 'address', 'phone', 'mobile', 'email'];

function decode(hash){
  var a = hash
  for(e='',r='0x'+a.substr(0,2)|0,n=2;a.length-n;n+=2)
    e+='%'+('0'+('0x'+a.substr(n,2)^r).toString(16)).slice(-2);
  return decodeURIComponent(e)
}

function processLinks(URLs){
  console.log(URLs)
  URLs.forEach(function(url, curr_index, curr_array){

    http.get(url, function(result) {
      result.pipe(bl(function (err, data) {
        if (err) return console.error(err);
        var parsedURL = cheerio.load(data.toString())
        var table = parsedURL('#member-details').html()
        var json_data = {}
        cheerio.load(table)('tr').each(function(index, row){
          var header = cheerio(row).children().first().html()
          var key = cheerio.load( header )('strong').html()
          var val = cheerio(row).children().eq(1).html()

          key = key.toLowerCase()
          if(key == 'email'){
            val = decode(cheerio.load(val)('span').attr('data-cfemail'))
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
            val = val.replace('\<br\>', ',')
          }

          json_data[key] = val
        })

        console.log('entry processed: ' + JSON.stringify(json_data));
        send_out_list.push(json_data)

      }))

      result.on('end', function(){
        console.log('processing data')
        json2csv({ data: send_out_list, fields: fieldHeaders }, function(err, csv) {
          if (err) console.log(err);
          fs.appendFile('file.csv', csv, function(err) {
            if (err) throw err;
            //console.log('entry saved: ' + JSON.stringify(json_data));
          });
        });
      })
    });

  })
}

function gotHTML(err, resp, html) {
  if (err) return console.error(err)
  var parsedHTML = cheerio.load(html)
  parsedHTML('h6 a').each(function(i, link) {
    var href = cheerio(link).attr('href')
    if (href.match('/\/find\-a\-planner\/[a-zA-Z0-9\-]+\/')) return
    URLs.push(href)
  })

  processLinks(URLs)

//URLs = [URLs[0]]


}

var domain = 'http://fpa.com.au/find-a-planner/Postcode-2000/1/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all'

request(domain, gotHTML)


