function errorHandling(err,req,res,next){
    const errStatus=err.status || 500;
    const errMsg=err.status || "Internal Server Error";
    return res.status(errStatus).json({
        success:false,
        status:errStatus,
        message:errMsg,
        stack:err.stack
    })
}
module.exports=errorHandling;