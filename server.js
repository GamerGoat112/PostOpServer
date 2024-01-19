const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const executeFlow = require('./twilio.js');

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const port = process.env.SERVER_PORT;

const userDatabase = [];

app.post('/users', (req, res) => {
    const { treatment, apptDate, phone } = req.body;
    const user = {
      treatment,
      apptDate,
      phone
    };

    userDatabase.push(user);
  
    executeFlow(user.phone, user.treatment, user.apptDate);
    
    res.status(201).json({
      message: 'Account created successfully, kindly check your phone to activate your account!',
      data: user
    })
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});

module.exports = app