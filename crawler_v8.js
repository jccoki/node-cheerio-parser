/*
 
this is a script crawler for
http://www.psychology.org.au/FindaPsychologist/Results.aspx

*/
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var entities = require("entities");

var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you

var date = new Date();
var ts = date.getFullYear().toString().slice(2) + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + (date.getDate() < 10? '0' + date.getDate() : date.getDate())

// change this to appropriate project name
var project_name = 'APS'
var input_dir = "./input";
var output_dir = "./output";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'address', 'phone', 'email', 'website'];

var csv_data = []
var header_line = '\"' + fieldHeaders.join('\",\"') + '\"\r\n'
fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', header_line);

fs.readdirAsync(input_dir).map(function (filename) {
  fs.readFileAsync(input_dir + '/' + filename, "utf8").then(function (content) {
    var parsedFile = cheerio.load(content.toString())
    var output_line = ''
    var parsedEl

    parsedFile('div.ResultsBody').each(function(index, el){
      var name = '', address = '', website = '', email = '', phone = ''

      if(cheerio(el).html() != ''){
        parsedEl =  cheerio(el)

        if(parsedEl.find('h3.ResultTitle') != ''){
          name = parsedEl.find('h3.ResultTitle').find('a').html()
          name = entities.decodeHTML(name)
        }
        name = "\"" + name + "\""

        if(parsedEl.find('span.ResultAddress') != ''){
          address = parsedEl.find('span.ResultAddress').find('span').html()
          address = address.replace(/\<span style=\"text-transform: lowercase !important;\"\>/g, '')
          address = address.replace(/\<\/span\>:/g, '')
          address = entities.decodeHTML(address)
        }
        address = "\"" + address + "\""

        if(parsedEl.find('span.ResultPhone') != ''){
          phone = parsedEl.find('span.ResultPhone').html()
          phone = entities.decodeHTML(phone)
        }
        phone = "\"" + phone + "\""

        if(parsedEl.find('span.ResultEmail') != ''){
          email = parsedEl.find('span.ResultEmail').html()
          email = entities.decodeHTML(email)
        }
        email = "\"" + email + "\""

        if(parsedEl.find('span.ResultWebsite') != ''){
          website = parsedEl.find('span.ResultWebsite').html()
          website = entities.decodeHTML(website)
        }
        website = "\"" + website + "\""

        output_line = name + ',' + address + ',' + phone + ',' + email + ',' + website
        console.log(output_line)

        fs.appendFileAsync( output_dir + '/' + output_file_name + '.log', output_line + '\r\n')
        fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', output_line + '\r\n');
      }
    })

    return {'file': filename, 'json_data' : csv_data}
  })
.then(function(log_file){
    console.log('\ndone processing: ' + log_file.file + '\n')
  })
})
