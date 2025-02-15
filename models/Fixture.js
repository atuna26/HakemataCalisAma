const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const FixtureSchema = new mongoose.Schema({
    fixtureId:{type:Number},
    groupId: {type: Schema.Types.ObjectId, ref: "Group"},
    leagueId: {type: Schema.Types.ObjectId, ref: "League"},
    homeTeam: {type: Schema.Types.ObjectId, ref: "Team" },
    awayTeam: {type: Schema.Types.ObjectId, ref: "Team"},
    derbyLevel:{type:Number},
    derbyDate: {type:Date},
    derbyHours: {type:String},
    derbyMinutes: {type:String},
    season: {type:Number},
    middleReferee: { type: Schema.Types.ObjectId, ref: "Post"},
    linemanReferee: { type: Schema.Types.ObjectId, ref: "Post"},
    secondLinemanReferee: { type: Schema.Types.ObjectId, ref: "Post"},
    fourthReferee: {type:Schema.Types.ObjectId,ref:"Post"},
    varReferee: {type:Schema.Types.ObjectId,ref:"Post"},
    secondVarReferee: {type:Schema.Types.ObjectId, ref:"Post"},
    date: {type:Date, default:Date.now}
})
module.exports = mongoose.model("Fixture", FixtureSchema)
