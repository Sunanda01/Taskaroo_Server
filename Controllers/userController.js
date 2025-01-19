const User=require('../Model/UserModel');
const bcrypt=require('bcrypt');
const bcrypt_SaltLevel=require('../Config/config').BCRYPT_SALTLEVEL;
const jwt=require('jsonwebtoken');
const jwtHashValue=require('../Config/config').JWTHASHVALUE;
const client=require('../Utils/RedisClient');
const mongoose = require("mongoose");
const customErrorHandling=require('../Services/customErrorHandling');

const userController={
    async register(req,res,next){
        const {name,email,password}=req.body;
        if(!name||!email||!password){
            return res.status(400),json({msg:"All fields are compulsary"});
        }
        const salt=await bcrypt.genSalt(Number(bcrypt_SaltLevel));
        const hashPassword=await bcrypt.hash(password,salt);
        try{
            const existUser=await User.findOne({email});
            if(existUser){
                return next(customErrorHandling.userExist("Email Already Registered"));
            }
        const newUser=new User({
            name,
            email,
            password:hashPassword
        });
        await newUser.save();
        console.log(newUser);
        return res.status(200).json({
            success:true,
            msg:"User Created",
            user:{
                id:newUser._id,
                name,
                email,
            }
        })
        
        }
        catch(err){
            console.log(err);
            return next(customErrorHandling.userExist("Email Already Registered"));
        }
    },
    async login(req,res,next){
        const{email,password}=req.body;
        try{
            const user=await User.findOne({email});
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            if(!user.verified) return next(customErrorHandling.userNotValid("User is not Verified!!!!"));
            const validatePassword=bcrypt.compareSync(password,user.password);
            if(!validatePassword) return res.status(401).json({msg:"Invalid Password"});
            const generateToken=jwt.sign({
                name:user.name,
                id:user._id,
                isVerified:user.validate
            },jwtHashValue);
            // localStorage.setItem('accessToken',generateToken);
            return res.status(200).json({
                success:true,
                msg:"User Login Successfully",
                user:{
                    id:user._id,
                    name:user.name,
                    verified:user.verified,
                    accessToken:generateToken
                }})
        }
        catch(err){
            console.log(err);
            return next(customErrorHandling.unAuthorisedUser("Unaurthorised User"));
        }
    },
    async updateProfile(req,res,next){
        try{
            // const {userId}=req.params;
            const userId=req.user.id;
            const user=await User.findById({_id:userId});
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const update={};
            if(req.body.name) update.name=req.body.name;
            if(req.body.password) update.password=req.body.password;
            if(req.body.email) return res.status(400).json({msg:"Email cannot be updated"});
            const updatedUser=await User.findByIdAndUpdate({_id:userId},update,{new:true});
            // if(!updatedUser) return res.status(400).json({msg:"User Not Found"});
            return res.status(200).json({success:true,msg:"User Details Updated",updatedUser});
        }
        catch(err){
            console.log(err);
            return next(err);
        }
    },
    async getDetails(req, res, next) {
        try {
            const userId = req.user.id;
            const cacheKey = `TodoUser_${userId}`;
            let cachedDetails = await client.get(cacheKey);
            if (cachedDetails) 
            {
                console.log("Returning cached data for user:", userId);
                return res.status(200).json(JSON.parse(cachedDetails));
            }
                      
            const getUser = await User.findById({ _id: userId });
            if (!getUser) return next(customErrorHandling.userNotExist("User Not Found"))
            const details = {
                id: getUser._id,
                name: getUser.name,
                email: getUser.email,
            };
            await client.set(cacheKey, JSON.stringify(details), "EX", 30); // EX=30 means the cache expires in 30 seconds
            console.log("Caching data for user:", userId);
            return res.status(200).json({success:true,details});
            } 
            catch (err) {
                console.error(err); // Debug log
                return next(err);
            }
    },
    async updatePassword(req, res,next) {
        try {      
          const id = req.user.id;
          const {oldPassword,newPassword}=req.body;
          const existUser = await User.findById(id);
          if (!existUser) return next(customErrorHandling.userNotExist("User Not Found"));
          const validatePassword=await bcrypt.compare(oldPassword,existUser.password);
          if(!validatePassword) return next(customErrorHandling.userNotValid("Invalid Password"));
          const update = {};
            const salt=await bcrypt.genSalt(Number(bcrypt_SaltLevel));
            const hashPassword=await bcrypt.hash(newPassword,salt);
            update.password = hashPassword;
            const updatedUser = await User.findByIdAndUpdate(id, update, { new: true });
          return res.status(200).json({ success:true, msg: "Password Updated", updatedUser });
        } 
        catch (err) {
          console.log("Error:", err);
          return next(err);
        }
      },
      
    async logout(req,res,next){
            try{
                const userId=req.user.id;
                const user=await User.findById({_id:userId});
                if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
                return res.status(200).json({success:true, msg:"Logout Successfully"});
            }
            catch(err){
                console.log(err);
                return next(err);
            }
    },
    async deleteProfile(req,res,next){
        try{
            const id=req.user.id;
            // if (!mongoose.Types.ObjectId.isValid(id)) {
            //     return next(customErrorHandling.userNotExist("User Not Found"));
            // }
            const user=await User.findById({_id:id});
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            await User.findByIdAndDelete(id);
            return res.status(200).json({success:true,msg:"Profile Deleted"});
        }
        catch(err){
            console.log(err);
            return res.status(400).json({success:false,msg:"Failed to delete profile"});
        }
    },
    async forgotPassword(req,res){
        try{
            const {email,password}=req.body;
            // if (!email) return res.status(400).json({ msg: "Email is required" });    
            const user=await User.findOne({email});
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const salt=await bcrypt.genSalt(Number(bcrypt_SaltLevel));
            const hashPassword=await bcrypt.hash(password,salt);
            user.password=hashPassword;
            await user.save();
            return res.status(200).json({ success:true, msg: "Password Updated",
                name:user.name,
                email,
             });
        }
        catch(err){
            console.log("Error:", err);
            return next(err);
        }
    }
}
module.exports=userController;