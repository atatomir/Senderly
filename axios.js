const axios = require('axios');

const instance = axios.create({
  baseURL: 'https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/'
});

module.exports = instance;
