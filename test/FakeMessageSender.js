module.exports = FakeMessageSender;


function FakeMessageSender(){
}

FakeMessageSender.prototype.verifyToken = function(req,res) {
    this.verifyTokenCount = this.verifyTokenCount == undefined ? 1 : this.verifyTokenCount++;
};


/*
 * Verify that the callback came from FacebookMessageSender. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
FakeMessageSender.prototype.verifyRequestSignature= function(req, res, buf) {
    this.verifyRequestSignatureCount = this.verifyRequestSignatureCount == undefined ? 1 : this.verifyRequestSignatureCount++;
};



/*
 * Send a message with an using the Send API.
 *
 */
FakeMessageSender.prototype.sendImageMessage= function(senderId,url) {
    this.sendImageMessageCount = this.sendImageMessageCount == undefined ? 1 : this.sendImageMessageCount++;
};




FakeMessageSender.prototype.getUserData = function(senderId,callBack){
    this.getUserDataCount = this.getUserDataCount == undefined ? 1 : this.getUserDataCount++;
};


/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
FakeMessageSender.prototype.sendMessage = function (messageData) {
    this.sendMessageCount = this.sendMessageCount == undefined ? 1 : this.sendMessageCount++;
};

/*
 /*
 * Send audio using the Send API.
 *
 */
FakeMessageSender.prototype.sendMessageData = function (recipientId,messagePart) {
    this.sendMessageDataCount = this.sendMessageDataCount == undefined ? 1 : this.sendMessageDataCount++;
};

/*
 * Send a Gif using the Send API.
 *
 */
FakeMessageSender.prototype.sendGifMessage = function (recipientId) {
    this.sendGifMessageCount = this.sendGifMessageCount == undefined ? 1 : this.sendGifMessageCount++;
};

/*
 * Send audio using the Send API.
 *
 */
FakeMessageSender.prototype.sendAudioMessage = function (recipientId) {
    this.sendAudioMessageCount = this.sendAudioMessageCount == undefined ? 1 : this.sendAudioMessageCount++;
};

/*
 * Send a video using the Send API.
 *
 */
FakeMessageSender.prototype.sendVideoMessage = function(recipientId) {
    this.sendVideoMessageCount = this.sendVideoMessageCount == undefined ? 1 : this.sendVideoMessageCount++;
};

/*
 * Send a video using the Send API.
 *
 */
FakeMessageSender.prototype.sendFileMessage = function(recipientId) {
    this.sendFileMessageCount = this.sendFileMessageCount == undefined ? 1 : this.sendFileMessageCount++;
};

/*
 * Send a button message using the Send API.
 *
 */
FakeMessageSender.prototype.sendButtonMessage = function(recipientId) {
    this.sendButtonMessageCount = this.sendButtonMessageCount == undefined ? 1 : this.sendButtonMessageCount++;
};


/*
 * Turn typing indicator on
 *
 */
FakeMessageSender.prototype.ssendTypingOn = function(recipientId) {
    this.ssendTypingOnCount = this.ssendTypingOnCount == undefined ? 1 : this.ssendTypingOnCount++;
};

/*
 * Turn typing indicator off
 *
 */
FakeMessageSender.prototype.ssendTypingOff =  function(recipientId) {
    this.ssendTypingOffCount = this.ssendTypingOffCount == undefined ? 1 : this.ssendTypingOffCount++;
};

/*
 * Send a message with the account linking call-to-action
 *
 */
FakeMessageSender.prototype.ssendAccountLinking = function(recipientId) {
    this.ssendAccountLinkingCount = this.ssendAccountLinkingCount == undefined ? 1 : this.ssendAccountLinkingCount++;
};


/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
FakeMessageSender.prototype.sendGenericMessage = function(recipientId) {
    this.sendGenericMessageCount = this.sendGenericMessageCount == undefined ? 1 : this.sendGenericMessageCount++;
};

/*
 * Send a text message using the Send API.
 */
FakeMessageSender.prototype.sendTextMessage = function(recipientId, messageText) {
    this.sendTextMessageCount = this.sendTextMessageCount == undefined ? 1 : this.sendTextMessageCount++;
};


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
FakeMessageSender.prototype.receivedDeliveryConfirmation = function(event){
    this.receivedDeliveryConfirmationCount = this.receivedDeliveryConfirmationCount == undefined ? 1 : this.receivedDeliveryConfirmationCount++;
};

