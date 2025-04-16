function errorHandling(err,req,res,next){
    const errStatus=err.status || 500;
    const errMsg=err.message || "Internal Server Error";
    return res.status(errStatus).json({
        success:false,
        status:errStatus,
        message:errMsg,
        stack:err.stack
    })
}
module.exports=errorHandling;