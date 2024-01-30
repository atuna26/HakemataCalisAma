const express = require("express");
const router = express.Router();
const Fixture = require("../models/Fixture");
const Optimization = require("../models/Optimization");
const League = require("../models/League");
const Team = require("../models/Team");
const Referee = require("../models/Post");
const Result = require("../models/Result");
const { exec } = require("child_process");
const fs = require("fs");
const { error } = require("console");
router.get("/", (req, res) => {
  Optimization.findById("64bfc1ca9c1676ae9aa17d8f").then((optimization) => {
    res.render("site/optimizasyon", { optimization: optimization.toJSON() });
  });
});

router.post("/baslat",  async (req, res) => {
  console.log("basladi")
  let leagueContent = ["ID_Level_LevelID_NumberTeam_NumberRef_LB_UB"];
  let teamContent = ["ID_ID2_LeagueID_RATE"];
  let fixtureContent = [
    "ID_ID2_Team1(id)_Team1(id2)_Team2(id)_Team2(id2)_GameRate_LeagueLevel_LeagueID",
  ];
  let refereeContent = ["ID_ID2_LeagueLevel_RATE_LeagueID"];
  let gContent = ["ID_Gmin_Gmax"];
  let cContent=["ID_X"]

  const optimization = await Optimization.findOne({_id: "64bfc1ca9c1676ae9aa17d8f"}).lean();
  const referee = await Referee.find({}).lean();



  referee.forEach(referee=>{
    let fixture = Fixture.find({}).lean()
    let fixtureReferee = Fixture.find({middleReferee:referee._id}).lean() //date kontrolü getir optimizasyon haftasından öncekileri kontrol etsin
    fixture.forEach(fixtureFirst=>{
      fixture.forEach(fixtureSecond=>{
        if(fixtureFirst.homeTeam==fixtureSecond.awayTeam&&fixtureFirst.awayTeam==fixtureSecond.homeTeam){
          cLine = `${referee._id}_${fixtureSecond.id}`;
          cContent.push(cLine);
        }
        

      })
    })
    if(optimization.Gmin==0){
      gLine = `${referee._id}_0_${optimization.Gmax}`;
      gContent.push(gLine);
    }else{
      newGmin=optimization.Gmin-fixtureReferee.size
      if(newGmin<0){
        newGmin=0
      }
      gLine = `${referee._id}_${newGmin}_${optimization.Gmax}`;
      gContent.push(gLine);
    }
  }).then(referee=>{
    fs.writeFileSync("c.txt", cContent.join("\n"));
    fs.writeFileSync("g.txt", gContent.join("\n"));
  })
  

  League.find({})
    .lean()
    .then((league) => {
      let line;
      league.forEach((league) => {
        line = `${league._id}_${league.importanceOfLeague}_0_10_0_0_0`;
        leagueContent.push(line);
      });
      fs.writeFileSync("League_Name.txt", leagueContent.join("\n"));
    });
  Team.find({})
    .lean()
    .then((team) => {
      let teamLine;
      team.forEach((team) => {
        teamLine = `${team._id}_0_${team.leagueName}_15`;
        teamContent.push(teamLine);
      });
      fs.writeFileSync("Teams.txt", teamContent.join("\n"));
    });
  Fixture.find({})
    .lean()
    .then((fixture) => {
      let fixtureLine;
      fixture.forEach((fixture) => {
        fixtureLine = `${fixture._id}_0_${fixture.homeTeam}_0_${fixture.awayTeam}_0_50_3_${fixture.leagueId}`;
        fixtureContent.push(fixtureLine);
      });
      fs.writeFileSync("Games.txt", fixtureContent.join("\n"));
    });
  Referee.find({})
    .lean()
    .then((referee) => {
      let refereeLine;
      referee.forEach((referee) => {
        refereeLine = `${referee._id}_0_5_${referee.importanceOfReferee}_0`;
        refereeContent.push(refereeLine);
      });
      fs.writeFileSync("Referees.txt", refereeContent.join("\n"));
    });

    // fs.access("Result.txt",fs.constants.F_OK,(err)=>{
    //   if (err){
    //     console.error("Dosya Zaten Yok", err)
    //   } else{
    //     fs.unlink('Result.txt', (err) => {
    //       if (err) {
    //         console.error(err);
    //       } else {
    //         console.log('File is deleted.');
    //       }
    //     });  
    //   }
    // })
    
    exec("java -jar optimizasyon.jar", (error, stdout, stderr) => {
    if (error) {
      console.error(`Hata: ${error.message}`);
      return res.status(500).send(`${error.message}`);
    }
    console.log(stdout);
    if (stdout.includes("Over")) {
      console.log("veritabanı kaydetme başladı");
      const result = fs.readFileSync("Result.txt", "utf-8");
      const lines = result.split("\n");
      lines.shift(); // Başlık satırını atla
      lines.forEach((line) => {
        const [A_ID, R_ID, A_P, R_P, P_D] = line.split(";").map(Number);
        Result.create({
            A_ID:A_ID,
            R_ID:R_ID,
            A_P:A_P,
            R_P:R_P,
            P_D:P_D,
        }).then(result=>{
            console.log("veri kaydedildi",result)
        })
      });
    }
    console.error(`Hata Çıktısı: ${stderr}`);
    res.send("Java JAR dosyası başarıyla çalıştırıldı.");
  });
});

router.get("/uyumlama", (req, res) => {
  res.render("site/uyumlama");
});
router.put("/64bfc1ca9c1676ae9aa17d8f", (req, res) => {
  Optimization.findOne({ _id: "64bfc1ca9c1676ae9aa17d8f" }).then(
    (optimization) => {
      optimization.nMaxRound = req.body.nMaxRound;
      optimization.nMaxRoundPun = req.body.nMaxRoundPun;
      optimization.nMaxSlots = req.body.nMaxSlots;
      optimization.nMaxSlotsPun = req.body.nMaxSlotsPun;
      optimization.save().then((optimization) => {
        res.redirect("/optimizasyon");
      });
    }
  );
});

router.post("/generalOptimization", (req, res) => {
  Optimization.create({
    ...req.body,
  })
    .then((optimization) => {
      req.session.sessionFlash = {
        type: "uk-alert-primary",
        message: "Optimizasyon Başarıyla Kaydedildi.",
      };
      res.redirect("/optimizasyon");
    })
    .catch((error) => {
      console.log(error);
      if (error.code === 11000) {
        req.session.sessionFlash = {
          type: "uk-alert-danger",
          message: "Hakem numarası zaten kullanılmaktadır.",
        };
      } else if (error.name === "ValidationError") {
        req.session.sessionFlash = {
          type: "uk-alert-danger",
          message: error.message,
        };
      } else {
        req.session.sessionFlash = {
          type: "uk-alert-danger",
          message: error.message,
        };
      }
      res.redirect("/ayarlar/referee");
    });
});

module.exports = router;
