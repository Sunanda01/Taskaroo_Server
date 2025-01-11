const jwt = require("jsonwebtoken");
const JWT_Hashvalue = require("../Config/config").jwtHashValue;

function verifyToken(req, res, next) {
  // const token=req.cookies.accesstoken

  const accessToken = req.headers.authorization; // BEARER Token => "bearer dkgoegjeighege154";
  // console.log(accessToken)
  if (!accessToken) return res.status(403).json({ msg: "User Unauthorized" });
  else {
    const token = accessToken.split(" ")[1];
    jwt.verify(token, JWT_Hashvalue, function (err, user) {
      if (err) return res.status(403).json({ msg: "Token Invalid" });
      req.user = user;
      next();
    });
  }
}
module.exports=verifyToken;