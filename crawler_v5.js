/*
 
this is a script crawler for 
http://www.mortgageandfinancehelp.com.au/find-accredited-broker/

*/
var Promise = require("bluebird");
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var entities = require("entities");

var fs = Promise.promisifyAll(require("fs")); //This is most convenient way if it works for you

var date = new Date();
var ts = date.getFullYear().toString().slice(2) + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + (date.getDate() < 10? '0' + date.getDate() : date.getDate())

var project_name = 'MF Help'
var input_dir = "./sites";

var output_file_name = project_name + ' Webscraped Data ' + ts

var fieldHeaders = ['name', 'email', 'office', 'mobile', 'position', 'city', 'state'];
var filePromises = []

// --
fs.readdirAsync(input_dir).map(function (filename) {
  var fileRead = fs.readFileAsync(input_dir + '/' + filename, "utf8")

  return Promise.join(fileRead, function(content){
      return {
        'name' : filename,
        'content' : content
      }
  })
}).each(function(file) {
  var json_data = []

  var content = file.content
  var parsedFile = cheerio.load(content.toString())

  parsedFile('.brokers-grid-wrapper').children('div.col-lg-4').each(function(index, el){
    var name = cheerio(el).find('.broker-desc').find('.broker-name').html()
    var email, phone_office = '', phone_mobile = ''
    var contact_details = cheerio(el).find('.broker-desc').find('p').html().split('<br>')
    var company_position = entities.decodeHTML( contact_details[0].replace('\n', '').trim() )
    var address = contact_details[1].replace('\n', '').split(',')
    var city = address[0].trim()
    var state = address[1].trim()

    cheerio(el).find('.broker-contact a').each(function(index, el){
      if(cheerio(el).attr('href').indexOf('mailto:') != -1){
        email = cheerio(el).html()
      }else{
        var contactNum = cheerio(el).html()

        if(contactNum.indexOf('Office:') != -1){
          phone_office = contactNum.replace('Office:', '').trim()
        }else{
          phone_mobile = contactNum.replace('Mobile:', '').trim()
        }

      }
    })
    var log_data = [name, email, phone_office, phone_mobile, company_position, city, state].join(' | ') + '\n'

    json_data.push({'name': name, 'email': email, 'office': phone_office, 'mobile': phone_mobile, 'position': company_position, 'city': city, 'state': state})
    fs.appendFileAsync( output_file_name + '.log', log_data )
  })

  json2csv({data: json_data, fields: fieldHeaders}, function(err, csv) {
    if (err) console.log(err);
    fs.appendFileAsync( output_file_name + '.csv', csv);
  });

  console.log('done processing: ' +  file.name)
})
