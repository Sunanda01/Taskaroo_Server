const { deleteOne } = require('../Model/otpModel');
const todoModel=require('../Model/todoModel');
const todoController={
    async createTodo(req,res){
        try{
            const{title,description}=req.body;
            const userId=req.user.id;

            const todo=new todoModel({
                title,
                description,
                userId
            });
            await todo.save();
            console.log(todo);
            return res.status(200).json({msg:"Todo Added Successfully"});
        }
        catch(err){
            console.log(err);
            return res.status(400).json({msg:"Something went wrong!!!"});
        }
    },
    async getAllTodo(req,res){
        try{
            const todoItem=await todoModel.find();
            const result=todoItem.map(item=>({
            title:item.title,
            description:item.description
            }))
            return res.status(200).json(result);
        }
        catch(err){
            console.log(err);
            return res.status(400).json({msg:"Unable to fetch Todo Items"});
        }
    },
    async updateTodo(req,res){
        try{
            const {todoId}=req.params;
            const update={};
            if(req.body.title) update.title=req.body.title;
            if(req.body.description) update.description=req.body.description;
            const updatedTodo=await todoModel.findByIdAndUpdate({_id:todoId},update,{new:true});
            if(!updatedTodo) return res.status(400).json({msg:"Todo Not Found"});
            return res.status(200).json({msg:"Todo updated Successfully",updatedTodo});
        }
        catch(err){
            console.log(err);
            return res.status(400).json({msg:"Failed to Update Todo"});
        }
    },
    async deleteTodo(req,res){
        try{
            const {todoId}=req.params;
            const delTodo=await todoModel.findById({_id:todoId});
            if(!delTodo) return res.status(404).json({msg:"ToDO Item Not found"});
            await todoModel.deleteOne({id});
            return res.status(200).json({msg:"Deleted Successfully",delTodo});
        }
        catch(err){
            console.log(err);
            return res.status(400).json({msg:"Failed to delete ToDo Items"});
        }
    }
}
module.exports=todoController;