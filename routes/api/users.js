const router = require('express').Router();
const User = require('mongoose').model('User');
const auth = require('../auth');
const validator = require('../validation');
// param

// Router ===========================================================
// register
router.post('/users', validator(['username', 'email', 'password'], 'user'), (fields, req, res, next) => {
  console.log('ROUTER /users : register : ', req.body);
  console.log('ROUTER /users : register : ', fields);

  const user = new User();
  user.username = fields.username;
  user.email = fields.email;
  user.setPassword(fields.username, fields.password);

  user
    .save()
    .then(() => res.json({ user: user.toAuthJSON() }))
    .catch(next);
});

// update
router.put('/user', auth.required, validator(['username', 'email'], 'user'), async (fields, req, res, next) => {
  console.log('ROUTER /user : update : fields : ', fields);
  console.log('ROUTER /user : update : req.body : ', req.body);

  const user = await User.findById(req.AUTH.id);
  if (!user) return res.status(401).json({ errors: { token: ['is broken.'] } });

  user.username = fields.username;
  user.email = fields.email;
  user.bio = fields.bio;
  user.image = fields.image;
  if (fields.password) user.setPassword(fields.password);

  return user
    .save()
    .then(() => res.json({ user: user.toAuthJSON() }))
    .catch(next);
});

// login
// router.post('/users/login', validator(['email', 'password'], 'user'), async (fields, req, res) => {
router.post('/users/login', validator(['email', 'password'], 'user'), async (fields, req, res, next) => {
  console.log('ROUTER /users/login : ', fields);

  const user = await User.findOne({ email: fields.email });
  if (!user) return res.status(422).json({ errors: { 'email or password': ['is invalid.'] } });
  if (!user.validPassword(fields.password))
    return res.status(422).json({ errors: { 'email or password': ['is invalid.'] } });

  console.log('>>> login : user : ', user);
  return res.json({ user: user.toAuthJSON() });
});

// app.get('/api/users', async (req, res) => {
//   const users = await Users.find({});
//   res.send(users);
// });

module.exports = router;
