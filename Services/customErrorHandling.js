class customErrorHandling extends Error{
    constructor(status,msg){
        super();
        this.status=status;
        this.message=msg;
    }
    
    
    static userExist(message = "User Already Exists") { 
        return new customErrorHandling(409, message); // 409: Conflict
    }
    
    static invalidOtp(message = "Invalid OTP") { 
        return new customErrorHandling(422, message); // 422: Unprocessable Entity (better than 400 for validation)
    }
    
    static userNotExist(message = "User Not Found") { 
        return new customErrorHandling(404, message); // 404: Not Found
    }
    
    static userNotValid(message = "User Not Valid") { 
        return new customErrorHandling(403, message); // 403: Forbidden
    }
    
    static invalidToken(message = "Token Not Valid") { 
        return new customErrorHandling(401, message); // 401: Unauthorized (since token issues relate to authentication)
    }
}
module.exports=customErrorHandling;