var jwt = require('jsonwebtoken');

const jwtOption = {
  issuer: 'lodny.com',
  expiresIn: 60,
};
const secretOrPublicKey = 'damhui';

const token = {
  get: (username, email) => {
    const payload = {
      username: username,
      email: email,
    };

    return jwt.sign(payload, secretOrPublicKey, jwtOption);
  },

  verify: (token) => {
    return jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        console.log('jwt.verify() err : ', err);
      } else {
        // console.log('jwt.verity() : decoded : ', decoded);
        return decoded;
      }
    });
  },
};

module.exports = token;
