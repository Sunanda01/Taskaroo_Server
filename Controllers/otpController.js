const otpModel=require('../Model/otpModel');
const User=require('../Model/UserModel');
const otp_generator=require('otp-generator');
const nodemailer=require('nodemailer');
const EMAIL_USER=require('../Config/config').EMAIL_USER;
const EMAIL_PASSWORD=require('../Config/config').EMAIL_PASSWORD;
const customErrorHandling=require('../Services/customErrorHandling');

const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    auth: {
      user: EMAIL_USER ,
      pass: EMAIL_PASSWORD,
    },
  });

  function generateNumericOtp(length) {
    const otp = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    return otp;
  }
  
const otpController={
    async generateAndSendOtp(req,res,next){
    const {email}=req.body;
    try{
        const user=await User.findOne({email});
        if(!user) return next(customErrorHandling.userNotExist("User Not Found"));
        // const otp = otp_generator.generate(4, { digits: true, upperCase: false, specialChars: false });
        // if(!otp) throw new Error('generated otp is false');
        // const otpNumber=parseInt(otp,10);
        // if(isNaN(otpNumber)) throw new Error('generated otp is invalid');
        // console.log(`Generated OTP: ${otpNumber}`);
        const otp = generateNumericOtp(4); 
        const otpRecord=new otpModel({
          userId:user._id,
          otp:otp
        });
        await otpRecord.save();

        const mailOptions={
          from:EMAIL_USER,
          to:email,
          subject:"EMAIL VERIFICATION",
          text:`Your OTP is ${otp}. It will expire in 2 minutes!!!`
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({success:true, msg:"OTP sent in your mail!!!"});
      }
      catch(err){
        console.log(err);
        return {msg:"Error in generating OTP!!"};
      }
        
    },
    async verifyOtp(req, res, next) {
      try {
        const { email, enteredOTP } = req.body;
        if (!email || !enteredOTP) return res.status(400).json({ msg: "Email and OTP are required" });  
        const user = await User.findOne({ email }); 

        if (!user) return next(customErrorHandling.userNotExist("User Not Found"));

        const otpRecords = await otpModel.find({ userId: user._id }).sort({ createdAt: -1 }).limit(1);
        const otpRecord = otpRecords[0];
  
        if (!otpRecord) return res.status(404).json({ msg: "No OTP found for this user" });
  
        if (otpRecord.otp !== enteredOTP) return next(customErrorHandling.invalidOtp("Invalid OTP"));
  
        user.verified = true;
        await user.save();
        await otpModel.deleteMany({userId:user._id});
        return res.status(200).json({success:true, msg: "OTP verification successful" });
      } 
      catch (err) {
        console.error("Error verifying OTP:", err);
        return res.status(500).json({ msg: "OTP verification failed" });
      }
    },
    
}

module.exports=otpController;