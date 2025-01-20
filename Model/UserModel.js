const mongoose = require('mongoose');
const user_Schema = mongoose.Schema({
    name: { type: String, required: true },
    profileImg:{type:String,default:"https://github.com/shadcn.png"},
    email: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    refreshToken:{type:String},
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'todoModel' }], 
},{Timestamp:true});

module.exports = mongoose.model('UserModel', user_Schema);
