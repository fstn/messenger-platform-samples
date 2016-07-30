module.exports = {
    get : _get
};

const
fs = require('fs');

var msg = JSON.parse(fs.readFileSync('./text/text.json', 'utf8'));

function _get(key){
    if(msg[key] == undefined ){
        throw new Error("UnableToGetTextKeyFor"+key+"Exception");
    }
    return msg[key].sort(function () {
        return Math.random() - 0.5;
    })[0];
};