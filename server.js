const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const cors = require('cors');

const { executeFlow, sendMessage } = require('./twilio.js');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.SERVER_PORT;

const userDatabase = [];

const postSurgeryCareMessages = {
  wisdomTeeth: [
    { delay: '0 minutes', message: "Welcome to Post Op! Your wisdom teeth removal is complete. We're here to guide you through your recovery." },
    { delay: '30 minutes', message: "Remember to bite down gently on the gauze packs to control bleeding. Change them every 30-45 minutes if needed." },
    { delay: '2 hours', message: "Start applying ice packs to your cheeks for 20 minutes on, 20 minutes off. This helps reduce swelling." },
    { delay: '4 hours', message: "It's time for your next dose of prescribed pain medication. Take it with a small sip of water." },
    { delay: '8 hours', message: "Gently rinse your mouth with warm salt water. Don't spit, let the water fall from your mouth." },
    { delay: '1 day', message: "Continue with ice packs today. Tomorrow, switch to warm compresses to help with any jaw stiffness." },
    { delay: '2 days', message: "Gradually start introducing soft foods. Yogurt, mashed potatoes, and smoothies are good options." },
    { delay: '1 week', message: "Great progress! Remember your follow-up appointment. Continue good oral hygiene, brushing gently around the surgical sites." }
  ],
  rootCanal: [
    { delay: '0 minutes', message: "Welcome to Post Op! Your root canal procedure is complete. We'll guide you through your recovery process." },
    { delay: '30 minutes', message: "The numbness should be wearing off. Be careful not to bite your cheek or tongue." },
    { delay: '2 hours', message: "You may experience some discomfort. Take over-the-counter pain relievers as directed by your dentist." },
    { delay: '4 hours', message: "Avoid chewing on the treated tooth. Stick to soft foods on the other side of your mouth." },
    { delay: '8 hours', message: "Gently brush your teeth, being careful around the treated area." },
    { delay: '1 day', message: "Continue to avoid chewing on the treated tooth. If you have a temporary crown, be extra cautious." },
    { delay: '2 days', message: "Any discomfort should be subsiding. If pain persists or worsens, contact your dentist." },
    { delay: '1 week', message: "Your tooth should be feeling better. Remember to schedule your appointment for the permanent crown if needed." }
  ],
};

function scheduleMessages(user) {
  console.log('scheduleMessages function called with user:', user);

  const messages = postSurgeryCareMessages[user.treatment];
  
  if (!messages) {
    console.error(`No messages found for treatment: ${user.treatment}`);
    return;
  }

  messages.forEach(({ delay, message }, index) => {
    const delayMinutes = parseDelay(delay);
    const scheduledDate = new Date(user.apptDate.getTime() + delayMinutes * 60000);
    
    if (delayMinutes === 0) {
      sendMessage(user.phone, message);
    } else {
      console.log(`Scheduling message for ${scheduledDate.toISOString()}`);

      schedule.scheduleJob(scheduledDate, async function() {
        console.log(`Attempting to send scheduled message: ${message}`);
        try {
          await sendMessage(user.phone, message);
          console.log(`Scheduled message sent successfully: ${message}`);
        } catch (error) {
          console.error(`Failed to send scheduled message: ${message}`, error);
        }
      });
    }
  });
}

function parseDelay(delay) {
  const [amount, unit] = delay.split(' ');
  switch (unit) {
    case 'minutes': return parseInt(amount);
    case 'hours': return parseInt(amount) * 60;
    case 'day': case 'days': return parseInt(amount) * 60 * 24;
    case 'week': case 'weeks': return parseInt(amount) * 60 * 24 * 7;
    default: return 0;
  }
}

app.post('/users', (req, res) => {
  const { treatment, phone } = req.body;
  console.log('Received request:', { treatment, apptDate, phone });

  if (!treatment || !apptDate || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Convert apptDate string to Date object
  const apptDate = new Date();

  const user = { treatment, apptDate, phone };

  userDatabase.push(user);

  try {
    // executeFlow(user.phone, user.treatment, user.apptDate);
    scheduleMessages(user);
    
    res.status(201).json({
      message: 'Account created successfully. You will receive care instructions via SMS.',
      data: user
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const myUser = {
  treatment: 'wisdomTeeth',
  apptDate: new Date(),
  phone: '+12087860961'
}
app.get('/test-message', async (req, res) => {
  const testMessage = 'This is a test message from your PostOp server.';
  
  try {
    await sendMessage(myUser);
    res.send('Test message sent successfully');
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).send('Error sending test message: ' + error.message);
  }
});

module.exports = app;