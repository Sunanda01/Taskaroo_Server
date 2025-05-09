const User=require('../Model/UserModel');
const todoModel=require('../Model/todoModel');
const customErrorHandling=require('../Services/customErrorHandling');
const todoController={
    async createTodo(req,res,next){
        try{
            const{title,description}=req.body;
            const userId=req.user.id;
            const user=await User.findById(userId);
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const todo=new todoModel({
                title,
                description,
                userId
            });
            await todo.save();
            return res.status(200).json({success:true, msg:"Todo Added Successfully",todo});
        }
        catch(err){
            return next(err);
        }
    },
    async getAllTodo(req,res,next){
        try{
            const userId=req.user.id;
            const user=await User.findById(userId);
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const todoItem=await todoModel.find({userId});
            // const result=todoItem.map(item=>({
            // title:item.title,
            // description:item.description
            // }))
            return res.status(200).json({success:true,todoItem});
        }
        catch(err){
            return next(err);
        }
    },
    async updateTodo(req,res,next){
        try{
            const userId=req.user.id;
            const user=await User.findById(userId);
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const {todoId}=req.params;
            const update={};
            if(req.body.title) update.title=req.body.title;
            if(req.body.description) update.description=req.body.description;
            const updatedTodo=await todoModel.findByIdAndUpdate(todoId,update,{new:true});
            if(!updatedTodo) return res.status(400).json({msg:"Todo Not Found"});
            return res.status(200).json({success:true, msg:"Todo updated Successfully",updatedTodo});
        }
        catch(err){
            return next(err);
        }
    },
    async deleteTodo(req,res,next){
        try{
            const userId=req.user.id;
            const user=await User.findById(userId);
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const {todoId}=req.params;
            const delTodo=await todoModel.findByIdAndDelete(todoId);
            if(!delTodo) return res.status(404).json({msg:"ToDO Item Not found"});
            // await todoModel.deleteOne({todoId});
            return res.status(200).json({success:true, msg:"Todo Deleted Successfully",delTodo});
        }
        catch(err){
            return next(err);
        }
    }
}
module.exports=todoController;