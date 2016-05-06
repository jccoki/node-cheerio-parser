/*
 
this is a parser for individually downloaded contacts from
http://www.australianlawyersdirectory.com.au/

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
var project_name = 'ALD'
var input_dir = "./input";
var output_dir = "./output";
var temp_dir = "./temp";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'address', 'phone', 'fax', 'email'];

var dataPromises = []
var filePromises = []
var header_line = '\"' + fieldHeaders.join('\",\"') + '\"\r\n'

// add column names as first row of excel file
fs.appendFileAsync( output_dir + '/' + output_file_name + '.csv', header_line);

// read the directory containing the temporary files
fs.readdirAsync(temp_dir).map(function (filename) {
  // read the files one by one
  fs.readFileAsync(temp_dir + '/' + filename, "utf8").then(function (content) {
    var output_line = ''
    // declare default column values
    var name =' ', fax = '', address = '', phone = '', email = ''
    // load the content of current file
    var parsedFile = cheerio.load(content.toString())
    var parsedEl

    if(parsedFile('div.profile__old-menu') != ''){
      parsedEl = parsedFile('div.profile-summary')
      parsedHTML = parsedEl.find('p').html().replace(/\n/g, '').split('<br>')

      name = "\"" + entities.decodeHTML(parsedEl.find('h5').html()) + "\""
      email = "\"" + cheerio.load(parsedHTML[parsedHTML.length - 1])('a').html() + "\""
      fax = "\"" + parsedHTML[parsedHTML.length - 3].split(':')[1] + "\""
      phone = "\"" + parsedHTML[parsedHTML.length - 4].split(':')[1] + "\""
      address = "\"" + parsedHTML[0].trim() + ' ' + parsedHTML[1].trim() + "\""
    }else{
      parsedEl = parsedFile('div.profile-limited-contact')
      if(parsedEl.find('p') != ''){
        parsedHTML = parsedEl.find('p').html().split('<br>')

        name = "\"" + entities.decodeHTML(parsedHTML[0].trim()) + "\""
        phone = "\"" + parsedHTML[parsedHTML.length - 1].split(':')[1].trim() + "\""
        address = "\"" + parsedHTML[1].trim() + ' ' + parsedHTML[2].trim() + "\""
      }
    }

    // prepare the data that will be put to the file as new record
    output_line = name + ',' + address + ',' + phone + ',' + fax + ',' + email
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

