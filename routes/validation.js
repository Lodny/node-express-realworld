const { body, validationResult } = require('express-validator');

// Before Route ===========================================================
// validation
const validator = (params, name = undefined) => {
  return async (req, res, next) => {
    const parent = name && req.body[name] ? name + '.' : '';
    const fields = name && req.body[name] ? req.body[name] : req.body;
    console.log('validation.js] validator : params : ', params);
    console.log('validation.js] validator : ', parent, fields);

    const blankMsg = "can't be blank.";
    const emailMsg = "is't email form.";
    // const validations = Object.keys(params).map((param) => {
    const validations = params.map((param) => {
      switch (param) {
        case 'username':
          return body(`${parent}${param}`).notEmpty().withMessage(blankMsg);
        case 'email':
          // return body(`${parent}${param}`).notEmpty().withMessage(blankMsg).isEmail().withMessage(emailMsg);
          return body(`${parent}${param}`).notEmpty().withMessage(blankMsg);
        case 'password':
          return body(`${parent}${param}`).notEmpty().withMessage(blankMsg);
        default:
          console.log('validation.js] validator : default : ');
          return body(`${parent}${param}`).notEmpty().withMessage(blankMsg);
      }
    });

    // console.log(data);
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const myErrors = errors.errors.reduce((newErrors, error) => {
        const param = error.param.slice(error.param.indexOf('.') + 1);
        if (!newErrors[param]) newErrors[param] = [];
        newErrors[param].push(error.msg);
        return newErrors;
      }, {});

      console.log('validation.js] ERROR ? ');
      return res.status(400).json({ errors: myErrors });
    }

    console.log('validation.js] NO, ERROR!');
    return next(fields);
  };
};

module.exports = validator;
