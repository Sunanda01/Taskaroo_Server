const routes=require('express').Router();
const userController=require('../Controllers/userController');
const otpController=require('../Controllers/otpController');
const todoController=require('../Controllers/todoController');
const verifyToken=require('../Middleware/verifyToken');

//user
routes.post("/register",userController.register);
routes.post("/login",userController.login);
routes.get("/getDetails/:userId",userController.getDetails);
routes.patch("/updateUser/:userId",verifyToken,userController.updateProfile);
routes.patch("/updatePassword",verifyToken,userController.updatePassword);
routes.get("/logout",verifyToken,userController.logout);
routes.patch("/forgetPassword",userController.forgotPassword);
routes.delete("/deleteProfile",verifyToken,userController.deleteProfile);

//OTP
routes.post("/generateotp",otpController.generateAndSendOtp);
routes.post("/verifyotp",otpController.verifyOtp);

//ToDo
routes.post("/createTodo",verifyToken,todoController.createTodo);
routes.get("/getTodoItems",todoController.getAllTodo);
routes.patch("/updateTodo/:todoId",verifyToken,todoController.updateTodo);
routes.delete("/deleteTodo/:todoId",verifyToken,todoController.deleteTodo);

module.exports=routes;