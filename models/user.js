const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    work: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('User', userSchema);