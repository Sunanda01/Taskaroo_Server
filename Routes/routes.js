const routes=require('express').Router();
const userController=require('../Controllers/userController');
const otpController=require('../Controllers/otpController');
const todoController=require('../Controllers/todoController');
const verifyToken=require('../Middleware/verifyToken');

//user
routes.post("/register",userController.register);
routes.post("/login",userController.login);
routes.get("/getDetails",verifyToken,userController.getDetails);
routes.patch("/updateUser",verifyToken,userController.updateUser);
routes.patch("/updatePassword",verifyToken,userController.updatePassword);
routes.post("/logout",verifyToken,userController.logout);
routes.patch("/forgetPassword",userController.forgotPassword);
// routes.delete("/deleteProfile",verifyToken,userController.deleteProfile);
routes.post("/refreshToken",userController.refreshAccessToken);

//OTP
routes.post("/generateotp",otpController.generateAndSendOtp);
routes.post("/verifyotp",otpController.verifyOtp);

//ToDo
routes.post("/createTodo",verifyToken,todoController.createTodo);
routes.get("/getTodoItems",verifyToken,todoController.getAllTodo);
routes.patch("/updateTodo/:todoId",verifyToken,todoController.updateTodo);
routes.delete("/deleteTodo/:todoId",verifyToken,todoController.deleteTodo);

module.exports=routes;