/*
 
this is a demo script crawler for
http://www.psychology.org.au/

*/
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var entities = require("entities");

var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you

var date = new Date();
var ts = date.getFullYear().toString().slice(2) + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + (date.getDate() < 10? '0' + date.getDate() : date.getDate())

var project_name = 'APS'
var input_dir = "./input";
var output_dir = "./output";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'address', 'phone', 'website', 'email'];

var csv_data = []
var header_line = '\"' + fieldHeaders.join('\",\"') + '\"\r\n'
fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', header_line);

fs.readdirAsync(input_dir).map(function (filename) {
  fs.readFileAsync(input_dir + '/' + filename, "utf8").then(function (content) {
    console.log(filename)
     var parsedFile = cheerio.load(content.toString())
     var name = '', address = '', website = '', email = '', phone = ''
     var output_line = ''
      var parsedEl
      parsedFile('div.ResultsBody').each(function(index, row){

        parsedEl =  cheerio(row)

        name = parsedEl.find('.ResultTitle').find('a').html()

        email = parsedEl.find('.ResultEmail').html()

        console.log(name + ' => ' + email)
  
      })

      return {'file': filename, 'json_data' : csv_data}

  })
})
