module.exports = {
    get : _get
};

const
    fs = require('fs'),
    Text = require("./Text.js");

var msg = JSON.parse(fs.readFileSync('./message/message.json', 'utf8'));

function _get(key) {
    if (msg[key] == undefined) {
        throw new Error("UnableToGetMessageKeyFor" + key + "Exception");
    }
    var result;
    result = msg[key];
    var resultAsString = JSON.stringify(result);
    var textToTranslatePattern = /#([^#]*)#/igm;
    var textToTranslateMatcher;
    var matcher = [];
    while (textToTranslateMatcher = textToTranslatePattern.exec(resultAsString)) {
        matcher.push(textToTranslateMatcher[1]);
    }
    matcher.forEach(function (match) {
        var translate = Text.get(match);
        resultAsString = resultAsString.replace("#" + match + "#", translate);
    });
    result = JSON.parse(resultAsString);
    return result;
}