const express = require("express")
const router = express.Router()
const League= require("../models/League")
const Team = require("../models/Team")
const Group = require("../models/Group")




router.get("/newleague",(req,res) =>{
    res.render("site/league")
 })

router.get("",(req,res) =>{
    League.find({}).sort({importanceOfLeague: -1}).lean().then(league =>{
        res.render("site/league", {league,league})
    })
})


router.get("/:id",(req,res) =>{
    Team.find({ leagueName: req.params.id }).sort({teamName:1}).lean().then(team =>{
        League.findById(req.params.id)
        .then(league => {
            Team.find({ leagueName: req.params.id }).sort({teamName:1}).lean().then(team =>{
                Group.find({leagueName: req.params.id}).populate({path:"teamName", model: Team}).sort({date:1}).lean().then(group =>{
                    res.render("site/league", {league:league.toJSON(),team:team,group:group})
                })
            })
        })
    })
    

})


router.post("/group",(req,res) =>{
    Group.create({
        leagueName : req.body.leagueName
    }).then(group =>{
        req.session.sessionFlash={
            type: "uk-alert-primary",
            message:"Grup başarıyla oluşturuldu."
        };
        res.redirect(`/ayarlar/league/${req.body.leagueName}#modal-container`)
    }).catch(error =>{
        console.log(error)
        req.session.sessionFlash = {
            type: "uk-alert-danger",
            message: error.message
        }
        res.redirect(`/ayarlar/league/${req.body.leagueName}#modal-container`)
    })
})

router.post("/lig",(req,res) =>{
    League.create({
        ...req.body,
        leagueMiddleRefereeIsChecked: req.body.leagueMiddleRefereeIsChecked === "on",
        leagueLinemanIsChecked: req.body.leagueLinemanIsChecked === "on",
        leagueFourthRefereeIsChecked: req.body.leagueFourthRefereeIsChecked === "on",
        leagueVarRefereeIsChecked: req.body.leagueVarRefereeIsChecked === "on",
        leagueSecondLinemanIsChecked: req.body.leagueSecondLinemanIsChecked === "on",
        leagueSecondVarRefereeIsChecked: req.body.leagueSecondVarRefereeIsChecked === "on"
    })
    .then(league =>{
        req.session.sessionFlash={
            type: "uk-alert-primary",
            message:"Lig başarıyla oluşturuldu."
        };
        res.redirect("/ayarlar/league")
    })
    .catch(error =>{
        console.log(error)
        req.session.sessionFlash = {
            type: "uk-alert-danger",
            message: error.message
        }
        res.redirect("/ayarlar/league")
    })
})


router.delete("/:id",(req,res) =>{
   
    League.remove({_id : req.params.id}).then(league => { 
        req.session.sessionFlash = {
          type: "uk-alert-warning",
          message: "Lig başarıyla silindi."
        };
        res.redirect("/ayarlar/league")
      })
      .catch(error => {         
          req.session.sessionFlash = {
              type: "uk-alert-danger",
              message: error.code+error.message
            }
        res.redirect("/ayarlar/league")
      });

})

router.put("/:id", (req,res) => {
    League.findOne({_id: req.params.id}).then(league => {
        league.groupNumber = req.body.groupNumber
        league.save().then(league => {
            res.redirect("back")
        })
    })

})


router.put("/edit/:id/", (req,res)=>{
    Group.findOneAndUpdate({_id: req.params.id}, {...req.body}, {new:true}).then(group =>{
        res.redirect("back")
    })
})



module.exports = router