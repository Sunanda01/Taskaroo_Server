const mongoose = require('mongoose');
const user_Schema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'todoModel' }], 
});

module.exports = mongoose.model('UserModel', user_Schema);
