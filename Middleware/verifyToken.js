const jwt = require("jsonwebtoken");
const JWT_Hashvalue = require("../Config/config").JWTHASHVALUE;
const customErrorHandling = require("../Services/customErrorHandling");
function verifyToken(req, res, next) {
  // const token=req.cookies.accesstoken

  const authHeader = req.headers["authorization"];
  const token =
    req.cookies?.accessToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);
  if (!token) return next(customErrorHandling.userNotValid("Invalid user"));
  else {
    // const token = accessToken.split(" ")[1];
    jwt.verify(token, JWT_Hashvalue, function (err, user) {
      if (err) return next(customErrorHandling.invalidToken("Invalid Token"));
      req.user = user;
      next();
    });
  }
}
module.exports = verifyToken;
