module.exports = Message;

const
    fs = require('fs');
Text = require("./Text.js");

function Message() {
    this.msg = JSON.parse(fs.readFileSync('./message/message.json', 'utf8'));
    this.text = new Text();
}

Message.prototype.get = function (key) {

    var self = this;
    if (this.msg[key] == undefined) {
        throw new Error("UnableToGetMessageKeyFor" + key + "Exception");
    }
    var result;
    result = this.msg[key];
    var resultAsString = JSON.stringify(result);
    var textToTranslatePattern = /#([^#]*)#/igm;
    var textToTranslateMatcher;
    var matcher = [];
    while (textToTranslateMatcher = textToTranslatePattern.exec(resultAsString)) {
        matcher.push(textToTranslateMatcher[1]);
    }
    matcher.forEach(function (match) {
        var translate = self.text.get(match);
        resultAsString.replace("#" + match + "#", translate);
    });
    result = JSON.parse(resultAsString);
    return result;
};