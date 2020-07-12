const express = require('express');
const axios = require('../axios.js');
const telegram = require('../api/telegram.js');

const router = express.Router();

router.get('/', (req, res, next) => {
  axios.get('getUpdates')
    .then(response => {

      response.data.result.forEach(async mess => {
        console.log(await telegram.manageMessage(mess));
      });

      res.status(200).json(response.data);

    })
    .catch(err => {
      console.log(err);
    })
});

router.get('/sethook', (req, res, next) => {
  let url = 'https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN +
              '/setWebhook?url=https://senderly.herokuapp.com%2Fupdate%2Fhook' + process.env.URL_TOKEN;

  if (req.query.deploy == 'false') {
    url = 'https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN +
          '/setWebhook?url=https://redirect123.herokuapp.com/?url=' +
          'http%3A%2F%2F5.13.210.62%2Fupdate%2Fhook' + process.env.URL_TOKEN;
  }

  axios.get(url)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

router.get('/deletehook', (req, res, next) =>
  axios.get('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/deleteWebhook')
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json(err);
    })
);

router.get('/hookinfo', (req, res, next) =>
  axios.get('https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/getWebhookInfo')
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json(err);
    })
);



router.post('/hook' + process.env.URL_TOKEN, async (req, res, next) => {
  const mess = req.body;
  console.log(mess);
  console.log(await telegram.manageMessage(mess));
  res.status(200).json('OK');
})



module.exports = router;
