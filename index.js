const express=require('express');
const connection=require('./Utils/connection');
const PORT=require('./Config/config').PORT;
const routes=require('./Routes/routes');

const app=express();
app.use(express.json());

app.use(routes);

app.listen(PORT,()=>{
    connection();
    console.log("connected to PORT",`${PORT}`);
})