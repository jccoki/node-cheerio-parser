/*
this script creates a list of links to be downloaded from 
http://www.australianlawyersdirectory.com.au
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

// read the contents of the target directory
fs.readdirAsync(input_dir).map(function (filename) {
  // read the content of the file one by one
  fs.readFileAsync(input_dir + '/' + filename, "utf8").then(function (content) {
    var parsedFile = cheerio.load(content.toString())
    var output_line = ''
    var parsedEl

    parsedFile('div.listing').each(function(index, el){
      var name = '', address = '', website = '', email = '', phone = '', qualification = ''
      var href = cheerio(el).find('div.listing-header').find('a').attr('href')
      // filter all external links that has contact information
      fs.appendFileAsync( output_dir + '/dl_' + output_file_name + '.lst', 'http://www.australianlawyersdirectory.com.au' + href + '\r\n')
      console.log(href)
    })
  })
})
