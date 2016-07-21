module.exports =
{
    log:_log
};

function _log(event){

    console.log(JSON.stringify(event));
    console.log(JSON.stringify(event.sender));
    console.log(JSON.stringify(event.recipient));
}
