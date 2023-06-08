const express = require("express")
const router = express.Router()
const User = require("../models/User")


router.get("/login",(req,res) =>{
    if(!req.session.userId){
        res.render("site/login")
    }else{
        res.redirect("/ayarlar/referee/")
    }
})

router.post("/login",(req,res) =>{
    const {username,password} = req.body
    User.findOne({username}, (error,user) =>{
        if(user){
            if(user.password == password){
                req.session.userId = user._id
                req.session.sessionFlash = {
                    type: "uk-alert-primary",
                    message: "Başarıyla giriş yapıldı."
                  }
                res.redirect("/ayarlar/referee")
                
            } else  {
                req.session.sessionFlash = {
                    type: "uk-alert-warning",
                    message: "Yanlış kullanıcı adı veya şifre lütfen tekrar deneyiniz."
                  }
                res.redirect("/users/login")
            }
        } else {
            req.session.sessionFlash = {
                type: "uk-alert-danger",
                message: "Herhangi bir üyelik bulunamadı. Sisteme giriş yapmak için lütfen kayıt olunuz."
              }
            res.redirect("/users/register")
        }
    })
})


router.get("/register",(req,res) =>{
    res.render("site/register")
})

router.post("/register",(req,res) =>{
    User.create(req.body, (error,user) =>{
        res.redirect("/users/login")
    })
})


module.exports = router