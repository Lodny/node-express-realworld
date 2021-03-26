const router = require('express').Router();

router.use('/', require('./users'));
router.use('/articles', require('./articles'));
// router.use('/profiles', require('./profiles'));
// router.use('/tags', require('./tags'));

router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    console.log('/api/index.js : ValidationError');

    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;
        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
