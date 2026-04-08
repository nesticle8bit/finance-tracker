const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign(
    { id: user.Id, email: user.Email, name: user.Name, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE }
  );
}

module.exports = { signToken };
