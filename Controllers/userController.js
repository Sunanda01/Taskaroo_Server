const User=require('../Model/UserModel');
const bcrypt=require('bcrypt');
const bcrypt_SaltLevel=require('../Config/config').BCRYPT_SALTLEVEL;
const jwt=require('jsonwebtoken');
const JWTHASHVALUE=require('../Config/config').JWTHASHVALUE;
const JWTTOKENEXPIRY=require('../Config/config').JWTTOKENEXPIRY;
const REFRESHJWTHASHVALUE=require('../Config/config').REFRESHJWTHASHVALUE;
const JWTREFRESHTOKENEXPIRY=require('../Config/config').JWTREFRESHTOKENEXPIRY;
const client=require('../Utils/RedisClient');
const mongoose = require("mongoose");
const customErrorHandling=require('../Services/customErrorHandling');
const generateAccessAndRefreshToken=async(userId)=>{
        const user=await User.findById(userId);
        if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
        const accessToken=jwt.sign({
            name:user.name,
            email:user.email,
            id:userId,
            isVerified:user.validate
        },JWTHASHVALUE,{expiresIn:JWTTOKENEXPIRY});

        const refreshToken=jwt.sign({
            id:user._id,
            
        },REFRESHJWTHASHVALUE,{expiresIn:JWTREFRESHTOKENEXPIRY});

        user.refreshToken=refreshToken;
        await user.save();
        return {accessToken,refreshToken};
}
const userController={
    async refreshAccessToken(req,res,next){
        try{
            const incomingRefreshToken=req.cookies.refreshToken;
            if(!incomingRefreshToken) return next(customErrorHandling.invalidToken("Invalid Token"));
            const decodedToken=jwt.verify(incomingRefreshToken,REFRESHJWTHASHVALUE);
            const userId=decodedToken.id;
            const user=await User.findById(userId);
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            if(incomingRefreshToken !== user.refreshToken) return res.status(400).json({success:false,msg:"Invalid Refresh Token"});
            // const options={
            //     httpOnly:true,
            //     secure:true,
            //     maxAge:15*60*1000
            // };
            const RefreshOptions={
                httpOnly:true,
                secure:true,
                maxAge:30*24*60*60*1000
            };
            const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
            // user.refreshToken=refreshToken;
            // await user.save();
            await User.findByIdAndUpdate(
                userId, 
                { refreshToken: refreshToken },  // Set new refresh token
              );
            return res
            .status(200)
            // .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,RefreshOptions)
            .json({
                success:true,
                msg:"Token Refreshed",
                user:{
                    id:user._id,
                    name:user.name,
                    verified:user.verified,
                    accessToken,
                    refreshToken
                }})
        }catch(err){
            return next(err);
        }
    },
    async register(req,res,next){
        const {name,email,password,profileImg}=req.body;
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
            password:hashPassword,
            profileImg
        });
        await newUser.save();
        return res.status(200).json({
            success:true,
            msg:"User Created",
            user:{
                id:newUser._id,
                name,
                email,
                profileImg,
            }
        })
        
        }
        catch(err){
            return next(customErrorHandling.userExist("Email Already Registered"));
        }
    },
    async login(req,res,next){
        const{email,password}=req.body;
        try{
            const user=await User.findOne({email});
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            // if(!user.verified) return next(customErrorHandling.userNotValid("User is not Verified!!!!"));
            const validatePassword=bcrypt.compareSync(password,user.password);
            if(!validatePassword) return res.status(401).json({msg:"Invalid Password"});
            const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
            // const options={
            //     httpOnly:true,
            //     secure:true,
            //     maxAge:15*60*1000
            // };
            const RefreshOptions={
                httpOnly:true,
                secure:true,
                maxAge:30*24*60*60*1000
            };
            return res
            .status(200)
            // .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,RefreshOptions)
            .json({
                success:true,
                msg:"User Login Successfully",
                user:{
                    id:user._id,
                    name:user.name,
                    verified:user.verified,
                    accessToken
                }})
        }
        catch(err){
            return next(customErrorHandling.userNotExist("User Not Found"));
        }
    },
    async updateUser(req,res,next){
        try{
            // const {userId}=req.params;
            const userId=req.user.id;
            const user=await User.findById({_id:userId});
            if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
            const update={};
            if(req.body.name) update.name=req.body.name;
            if(req.body.password) update.password=req.body.password;
            const updatedUser=await User.findByIdAndUpdate({_id:userId},update,{new:true});
            // if(!updatedUser) return res.status(400).json({msg:"User Not Found"});
            return res.status(200).json({success:true,msg:"User Details Updated",
                name:updatedUser.name
            });
        }
        catch(err){
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
                // console.log("Returning cached data for user:", userId);
                return res.status(200).json(JSON.parse(cachedDetails));
            }
                      
            const getUser = await User.findById({ _id: userId });
            if (!getUser) return next(customErrorHandling.userNotExist("User Not Found"))
            const details = {
                id: getUser._id,
                name: getUser.name,
                email: getUser.email,
                profileImg:getUser.profileImg
            };
            await client.set(cacheKey, JSON.stringify(details), "EX", 120); // EX=30 means the cache expires in 30 seconds
            // console.log("Caching data for user:", userId);
            return res.status(200).json({success:true,details});
            } 
            catch (err) {
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
          return res.status(200).json({ success:true, msg: "Password Updated", 
            id:updatedUser._id,
            name:updatedUser.name,
            email:updatedUser.email,
        });
        } 
        catch (err) {
          return next(err);
        }
      },
      
    async logout(req,res,next){
            try{
                // console.log(req.user.id);
                const userId=req.user.id;
                const user= await User.findByIdAndUpdate(userId,{$set:{refreshToken:undefined}},{new:true});
                if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
                const options={
                    httpOnly:true,
                    secure:true
                }
                
                return res.status(200)
                // .clearCookie("accessToken",options)
                .clearCookie("refreshToken",options)
                .json({success:true, msg:"Logout Successfully"});
            }
            catch(err){
                return next(err);
            }
    },
    async forgotPassword(req,res,next){
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
            return next(err);
        }
    }
}
module.exports=userController;
