class customErrorHandling extends Error{
    constructor(status,msg){
        super();
        this.status=status;
        this.message=msg;
    }
    static unAuthorisedUser(message="Unauthorised User") {return new customErrorHandling(401,message);}
    static userExist(message="User Already Exist") {return new customErrorHandling(409,message);}
    static invalidOtp(message="Invalid OTP") {return new customErrorHandling(400,message);}
    static userNotExist(message="User Not Found") {return new customErrorHandling(404,message);}
    static userNotValid(message="User Not Valid") {return new customErrorHandling(403,message);}
}
module.exports=customErrorHandling;