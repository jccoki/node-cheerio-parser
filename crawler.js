// vim: st=2 ts=2 expandtab
	
var http = require("http");
var qs = require('querystring');
var bl = require('bl')

var sites = []

sites['2000'] = [
  'http://fpa.com.au/find-a-planner/Postcode-2000/1/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/2/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/3/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/4/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/5/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/6/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all',
  'http://fpa.com.au/find-a-planner/Postcode-2000/7/?Postcode=2000&Distance=100&States=&Company=&Language=&First_Name=&Member_Surname=&type=all'
]

var listUrls = [sites['2000'][0]];
var resultData = [];

function displayResult() {
  listUrls.forEach(function(url) {
    console.log(resultData[url]);
  });
}

function doRequest(url) {
  http.get(url, function(result) {
    result.pipe(bl(function (err, data) {
      if (err) return console.error(err);
        resultData[url] = data.toString();
      if (Object.keys(resultData).length === listUrls.length) {
        displayResult();
      }
    }))
  });
}

console.log('starting..')
for (var i = 0; i < listUrls.length; i++) {
  console.log(listUrls[i])
  doRequest(listUrls[i]);
}

