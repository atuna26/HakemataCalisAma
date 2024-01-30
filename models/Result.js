const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const ResultSchema = new mongoose.Schema({
    A_ID:{type:String},
    R_ID:{type:String},
    A_P:{type:String},
    R_P:{type:String},
    P_D:{type:String}
})
module.exports = mongoose.model("Result", ResultSchema)
