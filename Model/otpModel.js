const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: { type: Number, required: true }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    createdAt: { type: Date, default: Date.now, expires: 120 }, 
})
module.exports = mongoose.model('otpModel', otpSchema);



