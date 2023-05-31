const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const PostSchema = new mongoose.Schema({
    refereeName: { type: String, require:true},
    refereeSurName: { type: String, require:true},
    refereeNumber: { type: Number, min: 0, require:true, unique:true},
    importanceOfReferee: { type: Number, min:0,max:10, },
    date: { type: Date, default: Date.now },
    middleRefereeIsChecked : {type:Boolean, default:false},
    linemanIsChecked : {type:Boolean, default:false},
    fourthRefereeIsChecked : {type:Boolean, default:false},
    varRefereeIsChecked : {type:Boolean, default:false},
    optionRefereeLeague : [{type: Schema.Types.ObjectId, ref: "league",}],
    optionRefereeGroup : [{type: Schema.Types.ObjectId, ref: "league",}],
    refereeTeam: [{type:Schema.Types.ObjectId, ref:"Team"}],

})


module.exports = mongoose.model("Post", PostSchema)