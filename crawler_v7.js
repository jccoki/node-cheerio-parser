/*
 
this is a script crawler for
https://www.publicaccountants.org.au/

*/
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var entities = require("entities");

var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you

var date = new Date();
var ts = date.getFullYear().toString().slice(2) + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + (date.getDate() < 10? '0' + date.getDate() : date.getDate())

var project_name = 'IPA'
var input_dir = "./input";
var output_dir = "./output";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'company', 'address', 'website', 'email'];

var csv_data = []
var header_line = '\"' + fieldHeaders.join('\",\"') + '\"\r\n'
fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', header_line);

fs.readdirAsync(input_dir).map(function (filename) {
  fs.readFileAsync(input_dir + '/' + filename, "utf8").then(function (content) {
    console.log(filename)
     var parsedFile = cheerio.load(content.toString())
     var name = '', company ='', address = '', website = '', email = '', language = '', services = '', additional_info = ''
     var output_line = ''
      var parsedEl
      parsedFile('article.bottomDashLine').each(function(index, row){
        if(cheerio(row).html() != ''){
          parsedEl =  cheerio(row)
          name = parsedEl.find('.fa-name').html()
          name =  entities.decodeHTML(name)
          name = '\"' + name + '\"'

          company = parsedEl.find('.fa-company').html()
          company = entities.decodeHTML(company)
          company = '\"' + company + '\"'

          address = parsedEl.find('.fa-address').html()
          address = entities.decodeHTML(address)
          address = address.replace(/\<br\>/g, ' ')
          address = '\"' + address + '\"'

          if( parsedEl.find('.fa-web a').html() ){
            website = parsedEl.find('.fa-web a').html()
            website = '\"' + website + '\"'
          }

          email = parsedEl.find('.fa-email a').html()
          email = '\"' + email + '\"'
//          parsedEl.find('.fa-col-2 div').each(function(index, data){
//            if( cheerio(data).hasClass('.fa-services-label') ){
//              service = cheerio(data)
//              service = service.html().toLowerCase()
//            }
//            if(service == 'services'){
//              services = cheerio(service).eq(index+1).html()
//              services = val.replace(/\s*/g, '')
//              services = language.replace('<ul><li>', '')
//              // replace all occurence of the string globally
//              services = language.replace(/<\/li><li>/g, ', ')
//              services = language.replace('</li></ul>', '')
//            }
//            if(service == 'languages spoken'){
//              language = cheerio(service).eq(index+1).html()
//              language = val.replace(/\s*/g, '')
//              language = language.replace('<ul><li>', '')
//              // replace all occurence of the string globally
//              language = language.replace(/<\/li><li>/g, ', ')
//              language = language.replace('</li></ul>', '')
//            }
//            if(service == 'additional info'){
//              additional_info = cheerio(service).eq(index+1).html()
//            }
//          })
          output_line = name + ',' + company + ',' + address + ',' + website + ',' + email
          fs.appendFileAsync( output_dir + '/' + output_file_name + '.log', output_line + '\r\n')
          fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', output_line + '\r\n');
        }
      })

      return {'file': filename, 'json_data' : csv_data}

  })
.then(function(log_file){
    console.log('done processing: ' + log_file.file)
  })
})
