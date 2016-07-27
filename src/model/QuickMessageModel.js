/**
 * Created by stephen on 27/07/2016.
 */
module.exports = QuickMessageModel;

function QuickMessageModel(text,quickReplies) {
    return {
        text:text,
        quick_replies: quickReplies
    }
}