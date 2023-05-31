const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: { type: String, require:true, unique:true },
    mail: { type: String, require:true, unique:true },
    password: { type: String, min: 0, require:true},
    phone: { type: Number, min: 0, require:true, unique:true},
    date: { type: Date, default: Date.now }
})

module.exports = mongoose.model("User", UserSchema)