const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

const requiredHandler = (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    // console.log('[I] AUTH : There is no auth');
    return res.status(400).send('There is no Token');
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        // console.log('[E] AUTH : Token does not match');
        return res.status(401).send('Token does not match');
      } else req.AUTH = decoded;
    });
  }

  next();
};

// const requiredIfgetHandler = (selection) => async (req, res, next) => {
//   const token = getTokenFromHeader(req);

//   if (!token) {
//     console.log('[I] AUTH : There is no auth');
//     return res.status(400).send('There is no Token');
//   } else {
//     jwt.verify(token, secret, (err, decoded) => {
//       if (err) {
//         console.log('[E] AUTH : Token does not match');
//         return res.status(401).send('Token does not match');
//       } else {
//         selection
//           .findById(decoded.id)
//           .then((doc) => {
//             console.log('doc', decoded, doc);
//             req.AUTH = decoded;
//             req.DOC = doc;
//           })
//           .catch((err) => {
//             console.log('[E] AUTH : Token does not match in DB');
//             return res.status(401).send('Token does not match in DB');
//           });
//       }
//     });
//   }

//   next();
// };

const optionalHandler = (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (token)
    jwt.verify(token, secret, (err, decoded) => {
      if (!err) req.AUTH = decoded;
    });

  // if (!token) console.log('[I] AUTH : There is no auth');
  // else {
  //   jwt.verify(token, secret, (err, decoded) => {
  //     if (err) console.log('[E] AUTH : Token does not match');
  //     else req.AUTH = decoded;
  //   });
  // }

  next();
};

const auth = {
  required: requiredHandler,
  // requiredIfget: requiredIfgetHandler,
  optional: optionalHandler,
};

module.exports = auth;
