const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const OptimizationSchema = new mongoose.Schema({
    Cr:{type:Number},
    Gmin:{type:Number},
    Gmax:{type:Number},
    nMaxRound: {type:Number},
    nMaxRoundPun: {type:Number},
    nMaxSlots: {type:Number},
    nMaxSlotsPun: {type:Number},
    nMaxGamesLg: {type:Number},
    nMaxGamesLgPun: {type:Number},
    nMinGamesTeam: {type:Number},
    nMinGamesTeamPun: {type:Number},
    nMaxGamesTeam: {type:Number},
    nMaxGamesTeamPun: {type:Number},
    nWait: {type:Number},
    nWaitPun: {type:Number},
    nRest: {type:Number},
    nRestPun:{type:Number},
    leagues: [{type:Schema.Types.ObjectId, ref:"League"}],
})

module.exports = mongoose.model("Optimization",OptimizationSchema);