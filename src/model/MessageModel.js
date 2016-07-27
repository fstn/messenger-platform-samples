/**
 * Created by stephen on 27/07/2016.
 */
module.exports = MessageModel;

function MessageModel(attachmentType,templateType,text,buttons) {

    return {
        attachment: {
            type: attachmentType,
            payload: {
                template_type: templateType,
                text: text,
                buttons: buttons
            }
        }
    }

}