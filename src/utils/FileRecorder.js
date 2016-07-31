/**
 * Created by stephen on 31/07/2016.
 */

module.exports =
{
    record:_record
};

const   http = require('http'),
        https = require('https'),
        fs = require('fs');

function _record(url,dest, cb){
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
}
