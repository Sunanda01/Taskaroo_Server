const jwt = require("jsonwebtoken");
const JWT_Hashvalue = require("../Config/config").JWTHASHVALUE;
const customErrorHandling=require('../Services/customErrorHandling');
function verifyToken(req, res, next) {
  // const token=req.cookies.accesstoken

  const token =req.cookies?.accessToken||req.headers["authorization"]?.replace("Bearer "," "); // BEARER Token => "bearer dkgoegjeighege154";
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
module.exports=verifyToken;