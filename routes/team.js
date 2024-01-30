const express = require("express")
const router = express.Router()
const Team = require("../models/Team")
const League = require("../models/League")

router.get("/newteam",(req,res) =>{
    res.render("site/team")
})


router.get("",(req,res) =>{
  Team.find({}).populate({path:"leagueName", model: League}).sort({teamName: 1}).lean().then(team =>{
    League.find({}).sort({leagueName:1}).lean().then(league =>{
      res.render("site/team", {team:team,league:league})
    })       
  })
})

router.get("/:id",(req,res) =>{
    Team.findById(req.params.id).then(team => {
        League.find({}).sort({leagueName:1}).lean().then(league =>{
          res.render("site/team", {team:team.toJSON(),league:league})
        })
    })
})

router.post("/takim",(req,res) =>{
  let teamNumber = 1;
  const oldteam = Team.findOne().sort({date:-1}).lean()
  if(oldteam)
    teamNumber=oldteam.teamId+1

    Team.create({...req.body,teamId:teamNumber,})
    .then(team => { //bildirim mesajları diğerlerine de eklenmeli.
      req.session.sessionFlash = {
        type: "uk-alert-primary",
        message: "Takım Başarıyla oluşturuldu."
      };
      res.redirect("/ayarlar/team")
    })
    .catch(error => {
        console.log(error)
            req.session.sessionFlash = {
                type: "uk-alert-danger",
                message: error.message
            }
          res.redirect("/ayarlar/team")
    });
    
})


router.delete("/:id",(req,res) =>{
   
    Team.remove({_id : req.params.id}).then(team => { //bildirim mesajları diğerlerine de eklenmeli.
        req.session.sessionFlash = {
          type: "uk-alert-warning",
          message: "Takım başarıyla silindi."
        };
        res.redirect("/ayarlar/team")
      })
      .catch(error => {         
          req.session.sessionFlash = {
              type: "uk-alert-danger",
              message: error.code+error.message
            }
        res.redirect("/ayarlar/team")
      });

})


module.exports = router