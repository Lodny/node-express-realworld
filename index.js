const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const usersRouter = require('./routes/users');
const userRouter = require('./routes/user');
const token = require('./routes/token');

// const myToken = token.get('drinkjuice', 'abc@naver.com');
// console.log(myToken);
// const ret = token.verify(myToken);
// console.log(ret);
// return;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users/', usersRouter);
app.use('/api/user/', userRouter);

// db connect --------------------------------------------------------
// const MONGODB_URL = "mongodb+srv://lodny:lodny@cluster0.tyk7q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGODB_URL = 'mongodb://localhost/realworld';
mongoose.connect(
  MONGODB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);

// listen --------------------------------------------------------
// -----------------------------------------------------------------
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('serve at http://localhost:5000'));
