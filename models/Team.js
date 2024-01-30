const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const TeamSchema = new mongoose.Schema({
    teamId:{type:Number},
    teamName: { type: String, require:true},
    leagueName: { type: Schema.Types.ObjectId, ref: "league"},
    date: { type: Date, default: Date.now },
    isTeamSelected: {type:Boolean, default:false},
})

module.exports = mongoose.model("Team", TeamSchema)
