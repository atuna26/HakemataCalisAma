const express = require("express")
const router = express.Router()
const Referee = require("../models/Post")
const League = require("../models/League")
const Fixture = require("../models/Fixture")
const Group = require("../models/Group")
const Team = require("../models/Team")

router.get("",(req,res )=>{
  Referee.find({}).sort({refereeName:1}).lean().then(referee=>{
    League.find({}).sort({leagueName: 1}).lean().then(league =>{
      Group.find({}).populate({path:"leagueName", model: League}).sort({date:1}).lean().then(group =>{
        Fixture.find({season:23}).populate({path:"homeTeam", model: Team}).populate({path:"awayTeam", model: Team}).lean().then(fixture =>{
          Team.find({}).populate({path:"leagueName", model: League}).sort({leagueName:1}).lean().then(team=>{
            res.render("site/fikstür", {league:league,fixture:fixture,referee:referee,group:group,team:team})
          })
      })
      })      
  })
  })
})

router.post("/playoff", async (req,res) => {
  let fixtureNumber = 1;
    const oldfixture = Fixture.findOne().sort({date:-1}).lean()
    if(oldfixture)
        fixtureNumber=oldfixture.fixtureId+1
  Fixture.create({...req.body,fixtureId:fixtureNumber}).then(team =>{
    req.session.sessionFlash = {
      type: "uk-alert-primary",
      message: `Maç Başarıyla oluşturuldu.`
    };
    res.redirect("/ayarlar/fixture")
  })
})

router.post("/league", async (req, res) => {
  const existingFixture = await Fixture.findOne({ groupId: req.body.scheduleLeague, season:req.body.season });
  if(existingFixture){
    req.session.sessionFlash={
      type: "uk-alert-warning",
      message:`Bu lige ${req.body.season}. sezon için fikstür zaten oluşturulmuş!`
  };
  res.redirect("/ayarlar/fixture")}
  else{
  try {
    let fixtureNumber = 1;
    const oldfixture = Fixture.findOne().sort({date:-1}).lean()
    if(oldfixture)
      fixtureNumber=oldfixture.fixtureId+1

    const derbyLevel = req.body.derbyLevel;
    const season = req.body.season;
    const groupNo = req.body.scheduleLeague;
    const group = await Group.findById(groupNo).populate("teamName");
    const leagueNo = group.leagueName
    const teams = group.teamName;
    const leagueId = await League.findById(leagueNo).populate("typeSelect");
    console.log(leagueId.typeSelect)
    // Takımlar arasındaki tüm müsabakaları oluştur
    const fixtures = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeTeam = teams[i]._id;
        const awayTeam = teams[j]._id;
        const fixture1 = new Fixture({
          groupId: groupNo,
          leagueId: leagueNo,
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          season: season,
          derbyLevel:derbyLevel,
          fixtureId:fixtureNumber
        });
        fixtureNumber++
        const fixture2 = new Fixture({
          groupId: groupNo,
          leagueId: leagueNo,
          homeTeam: awayTeam,
          awayTeam: homeTeam,
          season: season,
          derbyLevel:derbyLevel,
          fixtureId:fixtureNumber,
        });
        if(leagueId.typeSelect==="Çift Devreli Lig")
        {
          await fixture1.save();
          await fixture2.save();
          fixtures.push(fixture1);
          fixtures.push(fixture2);
        }else if(leagueId.typeSelect==="Tek Devreli Lig"){
          await fixture1.save();
          fixtures.push(fixture1);
        }
       

      }
    }

    res.redirect(`/ayarlar/fixture`)
  } catch (error) {
    console.log(error)
    req.session.sessionFlash = {
        type: "uk-alert-danger",
        message: error.message
    }
    res.redirect(`/ayarlar/fixture`)
    }
  }
});
  
router.put("/:id/", (req,res) => {
    Fixture.findOneAndUpdate({_id: req.params.id}, {...req.body}, {new: true}).then(fixture => {
        res.redirect(`/ayarlar/fixture`)
    })
})
module.exports = router