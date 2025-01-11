const mongoose=require('mongoose');
const BACKEND_CONNECTION_URL=require('../Config/config').BACKEND_CONNECTION_URL;
const connection=async()=>{
    try{
        await mongoose.connect(BACKEND_CONNECTION_URL);
        console.log("DB Connected");
    }catch(err){
        console.log(err);
    }
}
module.exports=connection;
