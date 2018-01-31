var cheerio = require('cheerio');
var rp = require('request-promise-native');
// var $ = require('jQuery');

var options = {
	uri: "https://shop.bitmain.com/main.htm?lang=en",
	transform: function(body){
		// console.log('$$$ start from cheerio $$$', body, '$$$ end from cheerio $$$')
		return cheerio.load(body);
	}
}

rp(options)
	.then(function($) {

    $('#cartList li').each(function (index, li) {
        var priceSTR = $(li).find('.price div[class*="currency"]').text();
        var price = Number(priceSTR.replace(/\D/g, ''));

        console.log(priceSTR, 'should be price', Number(priceSTR.replace(/\D/g, '')));

        if (price > 2100) {
          var name = $(li).find('.goodsDescrip h2').text();
          var button = $(li).find('.button_set button[class!="learn"]').text();

          console.log(name, button, 'name and button');

          if (!/sold/i.test(button)) {
          	console.log('good results, sending to chen', name + button)
            // console.log(`Message we sent with ${name.textContent} and ${button.textContent}. We are ready for you`)
          } else {
          	console.log('SOLD OUT OF ', name + button)
            // console.log(`OUT OF STOCK ${name.textContent} and ${button.textContent}.NOOO!!`)
          }
        }
      })
  })
		// console.log('### start in rp##' ,$, '### end in rp###')})
	.catch(function(err){console.error('its really an error', err, 'an error has occured')})

//.button_set 2 buttons, not button class=learn butt class (add or sold)
//if add then go if sold then no

//.price .currency-USD-88    .text or .innerHTML

