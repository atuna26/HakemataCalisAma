const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const LeagueSchema = new mongoose.Schema({
    leagueId:{type:Number},
    leagueName : {type:String, require:true, unique: true},
    typeSelect : {type:String, require: true},
    matchDuration: {type:Number},
    importanceOfLeague : {type: Number, require:true},
    leagueMiddleRefereeIsChecked : {type:Boolean, default:false},
    leagueLinemanIsChecked : {type:Boolean, default:false},
    leagueSecondLinemanIsChecked: {type:Boolean, default:false},
    leagueFourthRefereeIsChecked : {type:Boolean, default:false},
    leagueVarRefereeIsChecked : {type:Boolean, default:false},
    leagueSecondVarRefereeIsChecked: {type:Boolean, default:false},
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("League", LeagueSchema)