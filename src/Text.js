module.exports = Text;

const
fs = require('fs');

function Text(){
    var self = this;
    self.msg = JSON.parse(fs.readFileSync('./text.json', 'utf8'));
}

Text.prototype.get = function(key){
    return self.msg[key].sort(function () {
        return Math.random() - 0.5;
    })[0];
};