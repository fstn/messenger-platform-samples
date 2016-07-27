/**
 * Created by stephen on 27/07/2016.
 */
module.exports = ButtonModel;

function ButtonModel(type,title,payload) {
    return {
        type: type,
        title: title,
        payload: payload
    }
}