var fs = require('fs');
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');

var join = Promise.join;
var request = Promise.promisifyAll(require('request'));

var listUrls = [
  'http://fpa.com.au/find-a-planner/Postcode-2000/1/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/2/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/3/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/4/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/5/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/6/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/7/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
]

var dataUrls = []

function gotHTML(err, resp, html) {
  if (err) return console.error(err)
  var parsedHTML = cheerio.load(html)
  parsedHTML('h6 a').each(function(i, link) {
    var href = cheerio(link).attr('href')
    if (href.match('/\/find\-a\-planner\/[a-zA-Z0-9\-]+\/')) return
    dataUrls.push(href)
  })
}


var promises = []
dataPromises = []

listUrls.forEach(function(url, index, arr){
  promises.push(request.getAsync(url))  
})

var send_out_list = []

var fieldHeaders = ['name', 'company', 'address', 'phone', 'mobile', 'email'];

function decode(hash){
  var a = hash
  for(e='',r='0x'+a.substr(0,2)|0,n=2;a.length-n;n+=2)
    e+='%'+('0'+('0x'+a.substr(n,2)^r).toString(16)).slice(-2);
  return decodeURIComponent(e)
}


function parseAll(){
  return Promise.all(promises).then(function(responses){
    responses.forEach(function(resp, index, arr){

      var parsedHTML = cheerio.load(resp.body)
      parsedHTML('h6 a').each(function(i, link) {
        var href = cheerio(link).attr('href')
        if (href.match('/\/find\-a\-planner\/[a-zA-Z0-9\-]+\/')) return
        dataPromises.push(request.getAsync(href))
        fs.appendFile('processed.log', href + '\r\n', function(err) {
          if (err) throw err;
        });
      })

    })

    return Promise.all(dataPromises)
  })
  .then(function(responses){
    responses.forEach(function(resp, index, arr){
       var parsedURL = cheerio.load(resp.body)
        var table = parsedURL('#member-details').html()
        var json_data = {}
        cheerio.load(table)('tr').each(function(index, row){
          var header = cheerio(row).children().first().html()

          // there seems seems problem loading the contents causing the script to fail here
//          console.log("header: " + header)

          //do nothing for 500 millis
          for(var i=0;i<=500;i++){}

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
            val = val.replace('<br>', ',').trim()
          }

          json_data[key] = val
        })

        send_out_list.push(json_data)
    })

  })
  .then(function(response){
    return send_out_list
  })
}

parseAll().then(function(message) {
  //console.log("all resolved", message);

  json2csv({ data: message, fields: fieldHeaders }, function(err, csv) {
    if (err) console.log(err);
    fs.appendFile('FPA Webscraped Data 160314.csv', csv, function(err) {
      if (err) throw err;
      //console.log('entry saved: ' + JSON.stringify(json_data));
    });
  });

})
