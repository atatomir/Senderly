const EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

const axios = require('../axios.js');
const mailer = require('../nodemailer.js');

const destination = {};
const queue = {};
const timeouts = {};


const sendMessage = chatId => text => {
  axios.get('/sendMessage?chat_id=' + chatId + '&text=' + text)
    .then(response => {
      console.log(response.data);
    })
    .catch(err => {
      console.log(err);
    })
}

const getAttachmentURL = path => {
  return 'https://api.telegram.org/file/bot' + process.env.TELEGRAM_TOKEN + '/' + path;
}

const getAttachment = async description => {
  const fileId = description.file_id;
  const response = await axios.get('getFile?file_id=' + fileId);
  return {
    path: getAttachmentURL(response.data.result.file_path),
    filename: description.file_name || 'photo.jpg'
  }
}

const checkSending = (user, reply) => () => {
  if (!queue[user.id] || queue[user.id].length < 1) return;
  if (!destination[user.id]) return;

  const allAttachments = [...queue[user.id]];

  mailer.sendMail({
    from: `"Senderly" <${process.env.EMAIL}>`,
    to: destination[user.id],
    subject: "New attachments from " + user.first_name + ' ' + user.last_name,
    attachments: allAttachments
  })
    .then(info => {
      delete queue[user.id];
      reply('Email sent to ' + destination[user.id] + ' with ' + allAttachments.length + ' attachment(s)');
      console.log(info);
    })
    .catch(err => {
      reply('Please try again.');
      console.log(err);
    })
}


const manageMessage = async message => {
  const updateId = message.updateId;
  const body = message.message;
  const reply = sendMessage(body.chat.id);
  const user = body.from;

  if (user.username === 'senderlybot') return;

  // Manage commands
  if (body.text) {
    body.text = body.text.toLowerCase();

    switch (body.text) {
      case '/start':
        reply('Hi! Please give me your email address.');
        break;

      default:
        if (!body.text.match(EMAIL_REGEX)) {
          reply("Invalid email: " + body.text);
          break;
        }

        destination[body.from.id] = body.text;
        reply("Email updated: " + body.text);
        setTimeout(checkSending(user, reply), 1 * 1000);
    }

    return false;
  }

  // Manage photos
  if (!destination[user.id]) {
    reply('Please specify your email address');
  }

  let attachments = [];
  if (body.photo) attachments.push(await getAttachment(body.photo[body.photo.length - 1]));
  if (body.document) attachments.push(await getAttachment(body.document));

  if (attachments.length == 0) return false;

  // Add photos to queue
  queue[user.id] = (queue[user.id] || []).concat(attachments);

  // Set timer for sending multiple photos
  if (timeouts[user.id]) clearTimeout(timeouts[user.id]);
  timeouts[user.id] = setTimeout(checkSending(user, reply), 10 * 1000);

  return true;
}

module.exports = {
  manageMessage: manageMessage
}
