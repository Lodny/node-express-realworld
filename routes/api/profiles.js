const router = require('express').Router();
const auth = require('../auth');
const User = require('mongoose').model('User');

// Param ===========================================================
// username
router.param('username', async (req, res, next, username) => {
  console.log('ROUTE profiles : before articles route : param : username ', username);

  const user = await User.findOne({ username: username });
  if (!user) return res.status(404).json({ errors: { username: ['is wrong URL.'] } });

  req.USER = user;

  return next();
});

// Router ===========================================================
// get profile
router.get('/:username', auth.optional, async (req, res, next) => {
  console.log('ROUTER /profiles : get one : AUTH : ', req.AUTH);
  console.log('ROUTER /profiles : get one : USER : ', req.USER);

  const user = req.AUTH ? await User.findById(req.AUTH.id) : null;

  return res.json({
    profile: req.USER.toProfileJSONFor(user)
  });
});

// follow
router.post('/:username/follow', auth.required, async (req, res, next) => {
  console.log('ROUTER /profiles : get one : AUTH : ', req.AUTH);
  console.log('ROUTER /profiles : get one : USER : ', req.USER);

  const user = await User.findById(req.AUTH.id);
  if (!user) return res.status(401).json({ errors: { token: ['is broken.'] } });

  console.log('following : ', user.following, user._id, req.USER._id);

  const followed = user.following.find((id) => id.toString() === req.USER._id.toString());

  console.log('ROUTE profiles : followed : ', followed);

  if (followed) {
    // unfollow
    user.following = user.following.filter((id) => id.toString() !== req.USER._id.toString());
  } else {
    // follow
    user.following.push(req.USER._id);
  }

  console.log('ROUTE profiles : user.following : ', user.following);

  return user
    .save()
    .then(() => res.json({ profile: req.USER.toProfileJSONFor(user) }))
    .catch(next);
});

// router.get('/', async (req, res, next) => {
//   console.log('ROUTER /profiles : get all :');
//   return 'ok';
// });

module.exports = router;
