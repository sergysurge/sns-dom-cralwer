var cheerio = require('cheerio');
var rp = require('request-promise-native');
var AWS = require('aws-sdk');
var otherSettings = require('./private/settings.json');

var phoneNumber = otherSettings.phoneNumber;
var defaultArn = otherSettings.defaultArn;
var defaultURL = otherSettings.defaultURL;
//set up the credentials from the json file
AWS.config.loadFromPath('./private/dev_settings.json');
var sns = new AWS.SNS();

var FUCKINGIMPORTANTCOUNTER = 0;


//Runs init,
//sets timeout to run every min
  //checks to see if item is available
  //with a try catch
    //by price
    //if avaiable
      //sms message to buy that shit boy
        //email too?
    //not available
      //from 10am - 9pm email notifications
        //12 notificatinos in total

// using set timeout

var initUri = function(uri){
  console.log('*************')
  console.log('JUST RESTARTED INIT')
  console.log('*************')

  console.log(FUCKINGIMPORTANTCOUNTER, 'whats the counter')

  var results = [];
  var errors = [];
  var rest = [];
  var turnedOnFlag = false;
  var options = {
    transform: function(body){return cheerio.load(body);}
  };

  typeof uri === 'string' && uri !== '' ?
    options.uri = uri :
    options.uri = defaultURL

  rp(options)
    .then(function($){
      $('#cartList li').each(function (index, li) {
        var priceSTR = $(li).find('.price div[class*="currency"]').text();
        var price = Number(priceSTR.replace(/\D/g, ''));

        console.log(priceSTR, 'should be price', Number(priceSTR.replace(/\D/g, '')));

        var name = $(li).find('.goodsDescrip h2').text();
        var button = $(li).find('.button_set button[class!="learn"]').text();

        if (price > 2100) {
          console.log(name, button, 'is price more than 2100');
          if (!/sold/i.test(button)) {
            //what to do when success
            console.log('good results, pushing to results', name.trim() + button.trim());
            results.push(name.trim() + ' ' + button.trim() + ' @ $' + price);

            // console.log(`Message we sent with ${name.textContent} and ${button.textContent}. We are ready for you`)
          } else {
            console.log('SOLD OUT OF ', name.trim() + button.trim())
            rest.push(name.trim() + ' ' + button.trim() + ' @ $' + price);
            // console.log(`OUT OF STOCK ${name.textContent} and ${button.textContent}.NOOO!!`)
          }
        } else {
          rest.push(name.trim() + ' ' + button.trim() + ' @ $' + price);
        }

      })
      //increase cuase ur sending
      FUCKINGIMPORTANTCOUNTER++

      if (results.length > 0) {
        if (turnedOnFlag) {

        } else {
          console.log('OMG THERE ARE RESULTS YESSSSSSSS')
          //send quickly via text
          var resultMessage = results.length > 1 ? results.join(' ::NEXT UP::') : results[0];
          InitSNS('text', options.uri, resultMessage, resultMessage, true);
          //send rest via email
          var restMessagea = rest.length > 1 ? rest.join(' ::NEXT UP::') : rest[0];
          var restSubjecta = 'NO LUCK ' + rest.length + ' amounts of fails';
          InitSNS('arn', options.uri, restMessagea, restSubjecta)
        }

      }

      //the usual flow
      if (FUCKINGIMPORTANTCOUNTER > 2) {
        FUCKINGIMPORTANTCOUNTER = 0;
        var restMessage = rest.length > 1 ? rest.join(' ::NEXT UP::') : rest[0];
        var restSubject = 'NO LUCK ' + rest.length + ' amounts of fails for this 10 min';
        InitSNS('arn', options.uri, restMessage, restSubject)
      } else {
        console.log('about to restart usual flow because counter is ', FUCKINGIMPORTANTCOUNTER)
        setTimeout(function(){initUri(options.uri)},60000);
      }
      console.log('NO LUCK ' + rest.length + ' amounts of fails for this 10 min')
      console.log('*******')
      console.log(rest.length > 1 ? rest.join(' ::NEXT UP::') : rest[0], 'rest messages')


    })
    .catch(function(err){
      console.error('its really an error', err, 'an error has occured');
      //log error messages here later

      //run after a min
      console.error('running default uri ', options.uri)
      setTimeout(function(){initUri()},60000)
    })

}


function InitSNS(type, uri, message, subject, rerun, TopicArn){


    var params = {
      Message: message, /* required */
      // MessageAttributes: {
      //   'somedata': {
      //     DataType: 'String', /* required */
      //     // BinaryValue: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
      //     StringValue: 'look at all this data in the message im passing'
      //   },
      //   /* '<String>': ... */
      // },
      Subject: subject,

      // MessageStructure: 'STRING_VALUE',
      //one of the following 3

    };
    if (type === 'text') {
      params.PhoneNumber = phoneNumber
    } else if (type === 'arn') {
      params.TopicArn = !TopicArn || TopicArn === '' ? defaultArn : TopicArn //The topic you want to publish to
      console.log(params.TopicArn, 'topicArn')
    }
    //later add e-mail
  // PhoneNumber: ,
  // TargetArn: endpointArn,

  sns.publish(params, function(err, data) {

      if (err){
        console.log(err, err.stack, '###'); // an error occurred
        //do error handleing here
        setTimeout(function(){initUri()},60000);
      } else {
        console.log(data, '$$$');           // successful response
        if (rerun) {
          console.log(data, 'RERAN &&&');
        } else {
          setTimeout(function () {
            initUri(uri)
          }, 60000);
        }
      }

    });

  // })

}
console.log('OMG SCARY')
initUri();
      //ANOTHER WAY FOR AWS CONFIG
// var settings = require('./private/dev_settings.json');
// AWS.config.update({
//   accessKeyId: settings.aws_access_key_id,
//   secretAccessKey: settings.aws_secret_access_key,
//   region: settings.region
// });