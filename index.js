const express = require('express');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(express.json());

// Routes
app.use('/update', require('./routes/update.js'));


app.listen(PORT, () => {
  console.log("Listening on " + PORT);
})
