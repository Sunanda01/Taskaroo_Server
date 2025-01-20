const express=require('express');
const connection=require('./Utils/connection');
const PORT=require('./Config/config').PORT;
const routes=require('./Routes/routes');
const errorHandling=require('./Middleware/ErrorHandling');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const FRONTEND_URL=require('./Config/config').FRONTEND_URL;
const app=express();
app.use(express.json());
app.use(cors({
    origin:FRONTEND_URL
}));
app.use(cookieParser());
app.use(routes);
app.use(errorHandling);
app.listen(PORT,()=>{
    connection();
    console.log("connected to PORT",`${PORT}`);
})