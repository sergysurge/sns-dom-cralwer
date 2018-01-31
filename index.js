var cheerio = require('cheerio');
var rp = require('request-promise-native');

var options = {
	uri: "https://shop.bitmain.com/main.htm?lang=en",
	transform: function(body){
		console.log('$$$ start from cheerio $$$', body, '$$$ end from cheerio $$$')
		return cheerio.load(body);
	}
}

rp(options)
	.then(function($) {console.log('### start in rp##' ,$, '### end in rp###')})
	.catch(function(err){console.error(err)})
