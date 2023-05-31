const mongoose = require("mongoose")

const Post = require("./models/Post")

mongoose.connect("mongodb://127.0.0.1/hakemdb_test", {
    useNewUrlParser:true,
    useUnifiedTopology:true
})


/* 
Post.create({
    refereeName:"Mehmet",
    refereeSurName:"teşko",
    refereeNumber:"364839"
}, (error,post)=>{
    console.log(error,post)
}) */