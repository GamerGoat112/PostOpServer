require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const executeFlow = (phone, treatment, apptDate) => {
  const client = require('twilio')(accountSid, authToken);
  client.studio.v2.flows('FW5ed3a14fd7b0b1a39c7de8a2cabfcc38')
    .executions
    .create({
       to: phone,
       from: process.env.TWILIO_PHONE_NUMBER,
       parameters: {
        treatment: treatment,
        apptDate: apptDate
       }
     })
    .then(execution => console.log('Execution created with SID: ', execution.sid));
}

async function sendMessage(phone, messageBody) {
  console.log('sendMessage called with:', { phone, messageBody });
  try {
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`Message sent: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

module.exports = { executeFlow, sendMessage };