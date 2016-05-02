/*
 
this is a script crawler for 
https://www.cpaaustralia.com.au/Account/FindCpa.mvc/FindCpa

*/
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var entities = require("entities");

var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you

var date = new Date();
var ts = date.getFullYear().toString().slice(2) + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + (date.getDate() < 10? '0' + date.getDate() : date.getDate())

var project_name = 'CPAAustralia'
var input_dir = "./temp";
var output_dir = "./output";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'address', 'email', 'phone', 'fax', 'website', 'language'];

var csv_data = []
var header_line = '\"' + fieldHeaders.join('\",\"') + '\"\r\n'
fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', header_line);

fs.readdirAsync(input_dir).map(function (filename) {
  fs.readFileAsync(input_dir + '/' + filename, "utf8").then(function (content) {
     var json_data = {}
     var parsedFile = cheerio.load(content.toString())
     var name = '', address = '', phone = '', fax = '', email = '', website = '', language = ''
     var output_line = ''

      parsedFile('table.v03 tr').each(function(index, row){
        var header = cheerio(row).children().first().html()
        var key = cheerio.load( header ).html()
        var val = '\"' + entities.decodeHTML(cheerio(row).children().eq(1).html()) + '\"'

        key = key.toLowerCase().replace(':', '')
        if(key == 'practice name'){
          key = 'name'
          name = val
        }

        if(key == 'address'){
          address = val
        }

        if(key == 'phone'){
          phone = val
        }

        if(key == 'fax'){
          fax = val
        }

        if(key == 'email'){
          val = cheerio.load(val)('a').html()
          email = val
        }

        if(key == 'website'){
          val = cheerio.load(val)('a').html()
          website = val
        }

        if(key == 'languages spoken'){
          language = val.replace(/\s*/g, '')
          language = language.replace('<ul><li>', '')
          // replace all occurence of the string globally
          language = language.replace(/<\/li><li>/g, ', ')
          language = language.replace('</li></ul>', '')
        }

//        if(!val){
//          val = ' '
//        }
//        if(key == 'languages spoken'){
//          val = ' '
//        }
//        json_data[key] = entities.decodeHTML(val)
        //var log_data = [name, address, phone, fax, email, website].join(' | ') + '\n'

      })
      output_line = name + ',' + address + ',' + email + ',' + phone + ',' + fax + ',' + website + ',' + language

//      csv_data.push(json_data)

      fs.appendFileAsync( output_dir + '/' + output_file_name + '.log', output_line + '\r\n')
      fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', output_line + '\r\n');

      return {'file': filename, 'json_data' : csv_data}

  })
//.then(function(response){
//    json2csv({data: response.json_data, fields: fieldHeaders}, function(err, csv) {
//      if (err) console.log(err);
//      fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', csv);
//    });
//
//    return response.file
//  })
.then(function(log_file){
    console.log('done processing: ' + log_file.file)
  })
})
