module.exports = IA;

const
    config = require('config'),
    request = require('request'),
    apiai = require('apiai');


// App Secret can be retrieved from the App Dashboard
const APP_APIAP = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('apiaiKey');


function IA (){
    var self = this;
}

IA.prototype.consumeMessage = function (recipientId,message,callBack){

    var aiapi = apiai(APP_APIAP);
    aiapi.language="FR";
    var request = aiapi.textRequest(message);

    request.on('response', function(response) {
        console.log(response);
        callBack(recipientId,response.result.fulfillment.speech,undefined);
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end()


}