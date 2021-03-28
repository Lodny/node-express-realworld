const router = require('express').Router();

router.use('/', require('./users'));
router.use('/articles', require('./articles'));
router.use('/profiles', require('./profiles'));
// router.use('/tags', require('./tags'));

// After Route ===========================================================
// validation - from db
router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    console.log('Route /api : :index : ValidationError');

    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        if (!errors[key]) errors[key] = [];
        errors[key].push(err.errors[key].message);
        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
