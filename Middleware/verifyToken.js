const jwt = require("jsonwebtoken");
const JWT_Hashvalue = require("../Config/config").JWTHASHVALUE;
const customErrorHandling = require("../Services/customErrorHandling");
function verifyToken(req, res, next) {
  // const token=req.cookies.accesstoken

  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    if (!token)
      return next(customErrorHandling.invalidToken("Token Not Found"));
    else {
      // const token = accessToken.split(" ")[1];
      jwt.verify(token, JWT_Hashvalue, function (err, user) {
        if (err) return next(customErrorHandling.invalidToken("Invalid Token"));
        req.user = user;
        next();
      });
    }
  } catch (err) {
    return next(customErrorHandling.invalidToken("Failed To Verify Token"));
  }
}
module.exports = verifyToken;
