const dotenv = require('dotenv');
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const executeFlow = (phone, treatment, apptDate) => {
  const client = require('twilio')(accountSid, authToken);
  client.studio.v2.flows('FW5ed3a14fd7b0b1a39c7de8a2cabfcc38')
    .executions
    .create({
       to: user.phone,
       from: process.env.TWILIO_PHONE_NUMBER,
       parameters: {
        treatment: treatment,
        apptDate: apptDate
       }
     })
    .then(execution => console.log('Execution created with SID: ', execution.sid));
}

module.exports = executeFlow;