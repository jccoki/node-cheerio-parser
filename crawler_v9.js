/*
 
this is a script crawler for
http://fpa.com.au/find-a-planner/

and an improved version of crawler_v2, crawler_v3
*/
// declare required modules
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var entities = require("entities");
var request = Promise.promisifyAll(require('request'))
var fs = Promise.promisifyAll(require("fs"));

// assemble the timestamp information that will be appended on the filename
var date = new Date();
var ts = date.getFullYear().toString().slice(2) + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + (date.getDate() < 10? '0' + date.getDate() : date.getDate())

// change this to appropriate project name
var project_name = 'FPA'
var input_dir = "./input";
var output_dir = "./output";
var temp_dir = "./temp";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'company', 'address', 'phone', 'email', 'qualification'];

var dataPromises = []
var filePromises = []
var header_line = '\"' + fieldHeaders.join('\",\"') + '\"\r\n'

// add column names as first row of excel file
fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', header_line);

function decode(hash){
  var a = hash
  for(e='',r='0x'+a.substr(0,2)|0,n=2;a.length-n;n+=2)
    e+='%'+('0'+('0x'+a.substr(n,2)^r).toString(16)).slice(-2);
  return decodeURIComponent(e)

}

// read the directory containing the temporary files
fs.readdirAsync(temp_dir).map(function (filename) {
  // read the files one by one
  fs.readFileAsync(temp_dir + '/' + filename, "utf8").then(function (content) {
    var output_line = ''
    // load the content of current file
    var parsedFile = cheerio.load(content.toString())
    var parsedTable = parsedFile('#member-details')
    // declare default column values
    var name =' ', company = '', address = '', phone = '', email = '', qualification = ''

    parsedTable.find('tr').each(function(index, row){
      var key = cheerio(row).children().first().find('strong').html().toLowerCase()
      var val = cheerio(row).children().eq(1).html()
      // determine what information is currently processed
      switch(key){
        case 'name':
          val =  val.replace(/\<sup\>&#xAE;\<\/sup\>/g, '')
          val = val.split(',')
          name = "\"" + val[0] + "\""
          qualification = "\"" + val[1] + "\""
          break;
        case 'company':
          company = "\"" + val + "\""
          break;
        case 'address':
          address = val.replace(/\<br\>/g, ', ')
          address = "\"" + address + "\""
          break;
        case 'phone':
          phone = phone = "\"" + val + "\""
          break;
        case 'email':
          if(cheerio.load(val)('span').attr('data-cfemail')){
            email = decode(cheerio.load(val)('span').attr('data-cfemail'))
          }
          email = "\"" + email + "\""
          break;
      }
    })
    // prepare the data that will be put to the file as new record
    output_line = name + ',' + company + ',' + address + ',' + phone + ',' + email + ',' + qualification
    // write the processed data to a file
    fs.appendFileAsync(output_dir + '/' + output_file_name + '.csv', output_line + '\r\n');
    // we just return an object information to notify the next step which file si already processed
    return {'file': filename}
  })
  .then(function(log_file){
    // delete the temporary file for cleanup
//          fs.unlinkAsync(temp_dir + '/' + log_file.file)
    console.log('done processing: ' + log_file.file)
  })
})

//// read the contents of the target directory
//fs.readdirAsync(input_dir).map(function (filename) {
//  // read the content of the file one by one
//  fs.readFileAsync(input_dir + '/' + filename, "utf8").then(function (content) {
//    var parsedFile = cheerio.load(content.toString())
//    var output_line = ''
//    var parsedEl
//
//    parsedFile('h6 a').each(function(index, el){
//      var name = '', address = '', website = '', email = '', phone = '', qualification = ''
//      var href = cheerio(el).attr('href')
//      // filter all external links that has contact information
//      if (href.match('\/find-a-planner\/[a-z0-9\-]*\/')){
//        dataPromises.push(request.getAsync(href))
//        return
//      }
//    })
//    // access the webpages and get their responses
//    return Promise.all(dataPromises)
//  })
//  .then(function(responses){
//    responses.forEach(function(resp, index, arr){
//      // we get the URL of the webpage to be used as filename for our temporary files
//      name = resp.req.path
//      if(resp.statusCode = 200){
//        // try to save publicly available web page
//        var name = name.replace('/find-a-planner/', '').replace('/', '')
//        filePromises.push(fs.writeFileAsync(temp_dir + '/' + name, resp.body))
//        fs.appendFileAsync( output_dir + '/' + output_file_name + '.log', name + '\r\n')
//      }else{
//        // report non-existent web page as missing
//        fs.appendFileAsync( output_dir + '/' + output_file_name + '_error.log', name + '\r\n')
//      }
//    })
//
//    // wait for all files to be saved to the target directory
//    Promise.all(filePromises).then(function(){
//      // read the directory containing the temporary files
//      fs.readdirAsync(temp_dir).map(function (filename) {
//        // read the files one by one
//        fs.readFileAsync(temp_dir + '/' + filename, "utf8").then(function (content) {
//          var output_line = ''
//          // load the content of current file
//          var parsedFile = cheerio.load(content.toString())
//          var parsedTable = parsedFile('#member-details')
//          // declare default column values
//          var name =' ', company = '', address = '', phone = '', email = '', qualification = ''
//
//          parsedTable.find('tr').each(function(index, row){
//            var key = cheerio(row).children().first().find('strong').html().toLowerCase()
//            var val = cheerio(row).children().eq(1).html()
//            // determine what information is currently processed
//            switch(key){
//              case 'name':
//                val =  val.replace('<sup>&#xAE;</sup>', '')
//                val = val.split(',')
//                name = "\"" + val[0] + "\""
//                qualification = "\"" + val[1] + "\""
//                break;
//              case 'company':
//                company = "\"" + val + "\""
//                break;
//              case 'address':
//                address = val.replace('<br>', ',')
//                address = "\"" + address + "\""
//                break;
//              case 'phone':
//                phone = phone = "\"" + val + "\""
//                break;
//              case 'email':
//                if(cheerio.load(val)('span').attr('data-cfemail')){
//                  email = decode(cheerio.load(val)('span').attr('data-cfemail'))
//                }
//                email = "\"" + email + "\""
//                break;
//            }
//          })
//          // prepare the data that will be put to the file as new record
//          output_line = name + ',' + company + ',' + address + ',' + phone + ',' + email + ',' + qualification
//          // write the processed data to a file
//          fs.appendFileAsync(output_dir + '/' + output_file_name + '.csv', output_line + '\r\n');
//          // we just return an object information to notify the next step which file si already processed
//          return {'file': filename}
//        })
//        .then(function(log_file){
//          // delete the temporary file for cleanup
//          fs.unlinkAsync(temp_dir + '/' + log_file.file)
//          console.log('done processing: ' + log_file.file)
//        })
//      })
//    })
//  })
//})
