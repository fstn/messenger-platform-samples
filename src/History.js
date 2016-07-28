/**
 * Created by stephen on 28/07/2016.
 */

module.exports = {
    get : _get,
    set : _set,
    clear : _clear

} ;
var sessions = {isbn:'',page:"",ex:'',nbMessage:0};

function _get(recipientId){
    if( sessions[recipientId] == undefined ){
        _clear(recipientId);
    }
    return sessions[recipientId];
}

function _set(recipientId,value){
    sessions[recipientId] =  value;
}

function _clear(recipientId) {
    sessions[recipientId] = {isbn:'',page:"",ex:'',nbMessage:0};
}