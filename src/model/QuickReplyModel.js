/**
 * Created by stephen on 27/07/2016.
 */
module.exports = QuickReplyModel;

function QuickReplyModel(type,title,payload) {
    return {
        content_type:type,
        title: title,
        payload: payload
    }
}