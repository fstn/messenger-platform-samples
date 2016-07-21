module.exports = IA;

function IA (){
    var self = this;
}

IA.prototype.consumeMessage = function (message,callBack){

    var aiapi = apiai(APP_APIAP);
    aiapi.language="FR";
    var request = aiapi.textRequest(message);

    request.on('response', function(response) {
        console.log(response);
        callBack(response);
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end()
}