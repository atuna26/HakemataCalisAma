const express = require("express")
const router = express.Router()
const Post = require("../models/Post")
const League = require("../models/League")
const Team = require("../models/Team")

router.get("/newreferee",(req,res) =>{
   res.render("site/hakemDataScreen")
})

router.get("",(req,res) =>{
    Post.find({}).sort({refereeName: 1}).lean().then(referee =>{
      League.find({}).sort({leagueName:1}).lean().then(league =>{
        Team.find({}).populate({path:"leagueName", model: League}).sort({teamName:1}).lean().then(team =>{
          res.render("site/ayarlar", {referee:referee,league:league,team:team})
        })
      })
    })
    
})

router.get("/:id",(req,res) =>{
        
    Post.findById(req.params.id).then(post => {
       res.render("site/hakemDataScreen", {post:post.toJSON()})
    })

})
router.post("/hakem",(req,res) =>{

    Post.create({
    ...req.body,
    middleRefereeIsChecked: req.body.middleRefereeIsChecked === "on",
    linemanIsChecked: req.body.linemanIsChecked === "on",
    fourthRefereeIsChecked: req.body.fourthRefereeIsChecked === "on",
    varRefereeIsChecked: req.body.varRefereeIsChecked === "on",

    })
    .then(post => { //bildirim mesajları diğerlerine de eklenmeli.
      req.session.sessionFlash = {
        type: "uk-alert-primary",
        message: "Hakem Başarıyla oluşturuldu."
      };
      res.redirect("/ayarlar/referee")
    })
    .catch(error => {
        console.log(error)
        if(error.code === 11000){ 
            req.session.sessionFlash = {
            type: "uk-alert-danger",
            message: "Hakem numarası zaten kullanılmaktadır."
          }
        }else if(error.name === 'ValidationError'){
            req.session.sessionFlash = {
                type: "uk-alert-danger",
                message: error.message
            }
        }
        else{
            req.session.sessionFlash = {
                type: "uk-alert-danger",
                message: error.message
            }
        }
          res.redirect("/ayarlar/referee")
    });

})

router.delete("/:id",(req,res) =>{
   
    Post.remove({_id : req.params.id}).then(post => { //bildirim mesajları diğerlerine de eklenmeli.
        req.session.sessionFlash = {
          type: "uk-alert-warning",
          message: "Hakem başarıyla silindi."
        };
        res.redirect("/ayarlar/referee")
      })
      .catch(error => {         
          req.session.sessionFlash = {
              type: "uk-alert-danger",
              message: error.code+error.message
            }
        res.redirect("/ayarlar/referee")
      });

})

module.exports = router