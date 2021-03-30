const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// =============================================================================
// Express
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// =============================================================================
// MongoDB
// connect
// const MONGODB_URL = "mongodb+srv://lodny:lodny@cluster0.tyk7q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGODB_URL = 'mongodb://localhost/realworld-express';
mongoose.connect(
  MONGODB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log('mongoose.connect() : error :', err);
    }
  }
);

// register db collection
require('./models/User');
require('./models/Article');
require('./models/Comment');
// require('./models/Tag');

// =============================================================================
// Router
// use routes
app.use(require('./routes'));

// =============================================================================
// Error
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log('404 error handler : ');
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
  console.log('app.js] error handler : ', err.stack);

  res.status(err.status || 500);

  res.json({
    errors: {
      error: err,
    },
  });
});

// =============================================================================
// listen
const port = process.env.PORT || 5000;
// console.log('process.env.NODE_ENV : ', process.env.NODE_ENV);
app.listen(port, () => console.log('serve at http://localhost:5000'));
// =============================================================================
