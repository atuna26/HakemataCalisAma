const express = require("express")
const router = express.Router()
const Optimization = require("../models/Optimization")
const League = require("../models/League")


router.get("/",(req,res) =>{
    Optimization.findById("64bfc1ca9c1676ae9aa17d8f").then(optimization =>{
        res.render("site/optimizasyon",{optimization:optimization.toJSON()})
    })
})

router.put("/64bfc1ca9c1676ae9aa17d8f",(req,res)=>{
    Optimization.findOne({_id:"64bfc1ca9c1676ae9aa17d8f"}).then(optimization=>{
        optimization.nMaxRound=req.body.nMaxRound
        optimization.nMaxRoundPun=req.body.nMaxRoundPun
        optimization.nMaxSlots=req.body.nMaxSlots
        optimization.nMaxSlotsPun=req.body.nMaxSlotsPun
        optimization.save().then(optimization=>{
            res.redirect("/optimizasyon")
        })
    })
})

router.post("/generalOptimization",(req,res)=>{
    Optimization.create({
        ...req.body
    }).then(optimization => {
        req.session.sessionFlash = {
            type: "uk-alert-primary",
            message: "Optimizasyon Başarıyla Kaydedildi."
          };
          res.redirect("/optimizasyon")
    }).catch(error => {
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
})
})

module.exports = router
