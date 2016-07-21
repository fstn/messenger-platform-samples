module.exports = Text;

const
fs = require('fs');

function Text(){
    this.msg = JSON.parse(fs.readFileSync('./text.json', 'utf8'));
}

Text.prototype.get = function(key){
    return this.msg[key].sort(function () {
        return Math.random() - 0.5;
    })[0];
};