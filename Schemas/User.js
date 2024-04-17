const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    Email : {
        type: String,
        required: true,
        unique: true
    },

    FirstName: {
        type: String,
        required: true
    },

    LastName: {
        type: String,
        required: true
    },

    Password: {
        type: String,
        required: true
    },

    Role: {
        type: String,
        default: 'Viewer'
    }

    
  
});

const User = mongoose.model('User', userSchema);
module.exports = User;