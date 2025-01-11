const mongoose = require('mongoose');
const to_do_Schema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true }, 
});

module.exports = mongoose.model('todoModel', to_do_Schema);
