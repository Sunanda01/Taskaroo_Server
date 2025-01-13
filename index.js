const express=require('express');
const connection=require('./Utils/connection');
const PORT=require('./Config/config').PORT;
const routes=require('./Routes/routes');
const errorHandling=require('./Middleware/ErrorHandling');

const app=express();
app.use(express.json());

app.use(routes);
app.use(errorHandling);
app.listen(PORT,()=>{
    connection();
    console.log("connected to PORT",`${PORT}`);
})