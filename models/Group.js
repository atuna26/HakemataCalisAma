const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const GroupSchema = new mongoose.Schema({
    leagueName: {type: Schema.Types.ObjectId, ref: "league",},
    teamName : [{type:Schema.Types.ObjectId, ref: "Team"}],
    date : {type:Date, default:Date.now}
})

module.exports = mongoose.model("Group", GroupSchema);