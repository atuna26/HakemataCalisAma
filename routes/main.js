const express = require("express")
const router = express.Router()
const League = require("../models/League")
const Team = require("../models/Team")
const Fixture = require("../models/Fixture")
const Referee = require("../models/Post")
const Group = require("../models/Group")
const Post = require("../models/Post")
const { text } = require("body-parser")


router.get("/script", async(req,res) =>{
  res.render("site/script")
})

router.post("/scriptBaslat" ,async(req,res)=>{
  try{
   // Takımları oluştur
const teams = [];
for (let i = 1; i < 160; i++) {
  const team = await Team.create({
    teamName: "Hakemata Test Takımı (Script)" + i,
    leagueName: "64804c0dcb3083a9e08c8d3a",
  });
  teams.push(team._id);
}

// Grupları oluştur
const groups = [];
for (let j = 0; j < 40; j++) {
  const teamNames = teams.slice(j * 4, (j + 1) * 4);
  const group = await Group.create({
    leagueName: "64804c0dcb3083a9e08c8d3a",
    teamName: teamNames,
  });
  groups.push(group._id);
}

// Takımların gruplarını güncelle
for (const teamId of teams) {
  const team = await Team.findById(teamId);
  team.groups = groups;
  await team.save();
}
    res.redirect("/")
  } catch (error) {
    console.error(error);
  }
})

//ana sayfa
router.get("/", async (req,res) =>{/* 
    const league = await League.find();
    const leagueCount = league.length; */
    const team = await Team.find();
    const teamCount = team.length;
    const fixture = await Fixture.find();
    const fixtureCount = fixture.length;
    const referee = await Referee.find();
    const refereeCount = referee.length;
    League.find({}).sort({leagueName:1}).lean().then(league =>{
      Group.find({}).populate({path:"leagueName", model: League}).sort({leagueName:1}).lean().then(group =>{
        res.render("site/index", {league:league,group:group,teamCount,fixtureCount,refereeCount})
      })
    })
})

//aralık için lig ara
router.post('/fikstur/leagueSearch', async (req, res) => {
  try {
    const { dateSearchBegin, dateSearchFinal, leagueSelectFixture, groupSelectFixture} = req.body;
    let start = new Date(dateSearchBegin);
    let end = new Date(dateSearchFinal);
    if(leagueSelectFixture){
      res.redirect(`/lig/${leagueSelectFixture}/gruplar?dateSearchBegin=${start}&dateSearchFinal=${end}`)
    }
    if(groupSelectFixture){
      res.redirect(`/grup/${groupSelectFixture}/maclar?dateSearchBegin=${start}&dateSearchFinal=${end}`)
    }else{
    const fixtures = await Fixture.find({
      derbyDate: {
        $gte: start,
        $lte: end,
      },
    }).populate('leagueId');

    const leagues = fixtures.reduce((acc, fixture) => {
      const league = fixture.leagueId;
      if (!acc[league._id]) {
        acc[league._id] = {
          name: league.leagueName,
          withoutReferee: 0,
          id: league._id,
          matchesWithReferee: 0,
        };
      }
      let hasReferee = false;
      if (league.leagueMiddleRefereeIsChecked && fixture.middleReferee) {
        hasReferee = true;
      }
      if (league.leagueLinemanIsChecked && fixture.linemanReferee) {
        hasReferee = true;
      }
      if (league.leagueSecondLinemanIsChecked && fixture.secondLinemanReferee) {
        hasReferee = true;
      }
      if (league.leagueFourthRefereeIsChecked && fixture.fourthReferee) {
        hasReferee = true;
      }
      if (league.leagueVarRefereeIsChecked && fixture.varReferee) {
        hasReferee = true;
      }
      if (league.leagueSecondVarRefereeIsChecked && fixture.secondVarReferee) {
        hasReferee = true;
      }
      if (hasReferee) {
        acc[league._id].matchesWithReferee++;
      } else {
        acc[league._id].withoutReferee++;
      }

      return acc;
    }, {});

    res.render('site/index', { leagues, start, end })}
  } catch (error) {
    console.error(error);
  }
});
//aralık için lig aranın devamı grup için
router.get('/lig/:id/gruplar', async (req, res) => {
  try {
    const leagueId = req.params.id;
    const { dateSearchBegin, dateSearchFinal } = req.query;
    const start = new Date(dateSearchBegin);
    const end = new Date(dateSearchFinal);

    const fixtures = await Fixture.find({
      derbyDate: { $gte: start, $lte: end},
      leagueId: leagueId,
    }).populate("groupId leagueId")
    const groups = fixtures.reduce((acc, fixture) =>{
      const group = fixture.groupId;
      const league = fixture.leagueId;

      if(!acc[group._id]){
        acc[group._id] = { id: group._id, matchesWithReferee:0, withoutReferee:0}
      }
      let hasReferee = false;
      if (league.leagueMiddleRefereeIsChecked && fixture.middleReferee) {
        hasReferee = true;
      }
      if (league.leagueLinemanIsChecked && fixture.linemanReferee) {
        hasReferee = true;
      }
      if (league.leagueSecondLinemanIsChecked && fixture.secondLinemanReferee) {
        hasReferee = true;
      }
      if (league.leagueFourthRefereeIsChecked && fixture.fourthReferee) {
        hasReferee = true;
      }
      if (league.leagueVarRefereeIsChecked && fixture.varReferee) {
        hasReferee = true;
      }
      if (league.leagueSecondVarRefereeIsChecked && fixture.secondVarReferee) {
        hasReferee = true;
      }
      if (hasReferee) {
        acc[group._id].matchesWithReferee++;
      } else {
        console.log(league)
        acc[group._id].withoutReferee++;
      }

      return acc;
    }, {})
    res.render('site/index', { groups,start,end
    });
  } catch (error) {
    console.error(error);
  }
});
//aralık için lig aranın devamı hakemler için
router.get('/grup/:id/maclar', async (req, res) => {
  try {
    const groupId = req.params.id;
    const { dateSearchBegin, dateSearchFinal } = req.query;
    const start = new Date(dateSearchBegin);
    const end = new Date(dateSearchFinal);

    Fixture.find({
      derbyDate: { $gte: start, $lte: end},
      groupId: groupId,
    }).populate("leagueId").populate({path:"homeTeam", model:Team}).populate({path:"awayTeam", model:Team}).populate({path:"middleReferee", model:Referee}).populate({path:"linemanReferee", model:Referee}).populate({path:"secondLinemanReferee", model:Referee}).populate({path:"fourthReferee", model:Referee}).populate({path:"varReferee", model:Referee}).populate({path:"secondVarReferee", model:Referee})
    .sort({derbyDate: 1}).lean().then(fixture =>{
      const league = fixture[0].leagueId
      Referee.find({}).lean().then(referee =>{
        res.render("site/index",{fixture:fixture,referee:referee,start,end,league:league})
      })
    })
  } catch (error) {
    console.error(error);
  }
});

router.get("/fikstur",async (req,res) =>{
    const fixture = await Fixture.find();
    const fixtureCount = fixture.length;
    res.render("atamalar/fiksturAtama", {fixtureCount})
});
//hakem arama
router.get("/fikstur/refereeSearch", async (req,res) =>{
  try {
    let start = new Date()
    let end = new Date(start.getTime() + (14 * 24 * 60 * 60 * 1000));
    const fixtures = await Fixture.find({
      derbyDate: {
        $gte: start,
        $lte: end,
      },
    }).populate('leagueId');

    const leaguesCount = fixtures.reduce((acc, fixture) => {
      const league = fixture.leagueId;
      if (!acc[league._id]) {
        acc[league._id] = {
          name: league.leagueName,
          id: league._id,
          middleRefereeCount:0,
          linemanRefereeCount:0,
          secondLinemanRefereeCount:0,
          fourthRefereeCount:0,
          varRefereeCount:0,
          secondVarRefereeCount:0
        };
      }
      if (fixture.middleReferee) {
        acc[league._id].middleRefereeCount++;
      }
      if (fixture.linemanReferee) {
        acc[league._id].linemanRefereeCount++;
      }
      if (fixture.secondLinemanReferee) {
        acc[league._id].secondLinemanReferee++;
      }
      if (fixture.fourthReferee){
        acc[league._id].fourthRefereeCount++;
      }
      if (fixture.varReferee){
        acc[league._id].varRefereeCount++;
      }
      if (fixture.secondVarReferee){
        acc[league._id].secondVarReferee++;
      }
      
      return acc;
    }, {});
    League.find({}).sort({leagueName:1}).lean().then(league =>{
      Group.find({}).populate({path:"leagueName", model: League}).sort({leagueName:1}).lean().then(group=>{
        res.render('site/hakemReports', { league:league,group:group,leaguesCount, start, end, })
      })
    })
  } catch (error) {
    console.error(error);
  }
})

router.post('/fikstur/refereeSearch', async (req, res) => {
  try {
    const { dateSearchBegin, dateSearchFinal,leagueSelectFixture,groupSelectFixture} = req.body;
    let start = new Date(dateSearchBegin);
    let end = new Date(dateSearchFinal);
    if(leagueSelectFixture){
      res.redirect(`/hakem/lig/${leagueSelectFixture}/gruplar?dateSearchBegin=${start}&dateSearchFinal=${end}`)
    }else if (groupSelectFixture){
      res.redirect(`/hakem/gruplar/${groupSelectFixture}/takimlar?dateSearchBegin=${start}&dateSearchFinal=${end}`)
    }
    const fixtures = await Fixture.find({
      derbyDate: {
        $gte: start,
        $lte: end,
      },
    }).populate('leagueId');

    const leaguesCount = fixtures.reduce((acc, fixture) => {
      const league = fixture.leagueId;
      if (!acc[league._id]) {
        acc[league._id] = {
          name: league.leagueName,
          id: league._id,
          middleRefereeCount:0,
          linemanRefereeCount:0,
          secondLinemanRefereeCount:0,
          fourthRefereeCount:0,
          varRefereeCount:0,
          secondVarRefereeCount:0
        };
      }
      if (fixture.middleReferee) {
        acc[league._id].middleRefereeCount++;
      }
      if (fixture.linemanReferee) {
        acc[league._id].linemanRefereeCount++;
      }
      if (fixture.secondLinemanReferee) {
        acc[league._id].secondLinemanReferee++;
      }
      if (fixture.fourthReferee){
        acc[league._id].fourthRefereeCount++;
      }
      if (fixture.varReferee){
        acc[league._id].varRefereeCount++;
      }
      if (fixture.secondVarReferee){
        acc[league._id].secondVarReferee++;
      }
      
      return acc;
    }, {});

    res.render('site/hakemReports', { leaguesCount, start, end })
  } catch (error) {
    console.error(error);
  }
});

//hakem araması devamı
router.get('/hakem/lig/:id/gruplar', async (req, res) => {
  try {
    const leagueId = req.params.id;
    const { dateSearchBegin, dateSearchFinal } = req.query;
    const start = new Date(dateSearchBegin);
    const end = new Date(dateSearchFinal);

    const fixtures = await Fixture.find({
      derbyDate: {
        $gte: start,
        $lte: end,
      },
      leagueId:leagueId,
    }).populate('groupId leagueId');

    const groupsCount = fixtures.reduce((acc, fixture) => {
      const group = fixture.groupId;
      if (!acc[group._id]) {
        acc[group._id] = {
          id: group._id,
          middleRefereeCount:0,
          linemanRefereeCount:0,
          secondLinemanRefereeCount:0,
          fourthRefereeCount:0,
          varRefereeCount:0,
          secondVarRefereeCount:0
        };
      }
      if (fixture.middleReferee) {
        acc[group._id].middleRefereeCount++;
      }
      if (fixture.linemanReferee) {
        acc[group._id].linemanRefereeCount++;
      }
      if (fixture.secondLinemanReferee) {
        acc[group._id].secondLinemanReferee++;
      }
      if (fixture.fourthReferee){
        acc[group._id].fourthRefereeCount++;
      }
      if (fixture.varReferee){
        acc[group._id].varRefereeCount++;
      }
      if (fixture.secondVarReferee){
        acc[group._id].secondVarReferee++;
      }
      
      return acc;
    }, {});

    res.render('site/hakemReports', { groupsCount,start,end });
  } catch (error) {
    console.error(error);
  }
});

router.get('/hakem/gruplar/:id/takimlar', async (req, res) => {
  try {
    const groupId = req.params.id;
    const { dateSearchBegin, dateSearchFinal } = req.query;
    const start = new Date(dateSearchBegin);
    const end = new Date(dateSearchFinal);

    const fixtures = await Fixture.find({
      derbyDate: {
        $gte: start,
        $lte: end,
      },
      groupId: groupId,
    }).populate('groupId leagueId middleReferee linemanReferee secondLinemanReferee fourthReferee varReferee secondVarReferee');

    const teamsCount = fixtures.reduce((acc, fixture) => {
      const homeTeam = fixture.homeTeam;
      const awayTeam = fixture.awayTeam;

      if (!acc[homeTeam._id]) {
        acc[homeTeam._id] = {
          id: homeTeam._id,
          referees:[]
        };
      }
      if (!acc[awayTeam._id]) {
        acc[awayTeam._id] = {
          id: awayTeam._id,
          referees: []
        };
      }

      if (fixture.middleReferee) {
        acc[awayTeam._id].referees.push({id:fixture.middleReferee._id,name:fixture.middleReferee.refereeName +" "+ fixture.middleReferee.refereeSurName})
        acc[homeTeam._id].referees.push({id:fixture.middleReferee._id,name:fixture.middleReferee.refereeName +" "+  fixture.middleReferee.refereeSurName})
      }
      if (fixture.linemanReferee) {
        acc[awayTeam._id].referees.push({id:fixture.linemanReferee._id,name:fixture.linemanReferee.refereeName +" "+ fixture.linemanReferee.refereeSurName})
        acc[homeTeam._id].referees.push({id:fixture.linemanReferee._id,name:fixture.linemanReferee.refereeName +" "+ fixture.linemanReferee.refereeSurName})
      }
      if (fixture.secondLinemanReferee) {
        acc[awayTeam._id].referees.push({id:fixture.secondLinemanReferee._id,name:fixture.secondLinemanReferee.refereeName + " "+ fixture.secondLinemanReferee.refereeSurName})
        acc[homeTeam._id].referees.push({id:fixture.secondLinemanReferee._id,name:fixture.secondLinemanReferee.refereeName + " "+ fixture.secondLinemanReferee.refereeSurName})
      }
      if (fixture.fourthReferee) {
        acc[awayTeam._id].referees.push({id:fixture.fourthReferee._id,name:fixture.fourthReferee.refereeName + " " + fixture.fourthReferee.refereeSurName})
        acc[homeTeam._id].referees.push({id:fixture.fourthReferee._id,name:fixture.fourthReferee.refereeName + " " + fixture.fourthReferee.refereeSurName})
      }
      if (fixture.varReferee) {
        acc[awayTeam._id].referees.push({id:fixture.varReferee._id,name:fixture.varReferee.refereeName +" "+ fixture.varReferee.refereeSurName})
        acc[homeTeam._id].referees.push({id:fixture.varReferee._id,name:fixture.varReferee.refereeName +" "+ fixture.varReferee.refereeSurName})
      }
      if (fixture.secondVarReferee) {
        acc[awayTeam._id].referees.push({id:fixture.secondVarReferee._id,name:fixture.secondVarReferee.refereeName+" "+ fixture.secondVarReferee.refereeSurName})
        acc[homeTeam._id].referees.push({id:fixture.secondVarReferee._id,name:fixture.secondVarReferee.refereeName+" "+ fixture.secondVarReferee.refereeSurName})
      }

      return acc;
    }, {});

    let outputTeams = [];
    for (const [teamId, groupData] of Object.entries(teamsCount)) {
      const team = await Team.findById(teamId);
      outputTeams.push({
        team: team.teamName,
        referees: groupData.referees
      });
    }

    res.render('site/hakemReports', { teamsCount:outputTeams });
  } catch (error) {
    console.error(error);
  }
});

router.post('/:id/hakem/leagueSearch', async (req, res) => {
  try {
    const { dateSearchBegin, dateSearchFinal, leagueSelectFixture, groupSelectFixture} = req.body;
    let start = new Date(dateSearchBegin);
    let end = new Date(dateSearchFinal);
    if(leagueSelectFixture){
      res.redirect(`/lig/${leagueSelectFixture}/gruplar?dateSearchBegin=${start}&dateSearchFinal=${end}`)
    }
    if(groupSelectFixture){
      res.redirect(`/grup/${groupSelectFixture}/maclar?dateSearchBegin=${start}&dateSearchFinal=${end}`)
    }else{
      const referee = await Post.findById(req.params.id).lean();
  
      const fixtures = await Fixture.find({
        $and: [
          {
            derbyDate: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          }
        ],
        $or: [
          { middleReferee: referee._id },
          { linemanReferee: referee._id },
          { secondLinemanReferee: referee._id },
          { fourthReferee: referee._id },
          { varReferee: referee._id },
          { secondVarReferee: referee._id }
        ]
      });
    
      let leagues = {};
    
      fixtures.forEach(fixture => {

    
        // Lig bilgisi
        if (fixture.leagueId in leagues) {
          leagues[fixture.leagueId]++;
        } else {
          leagues[fixture.leagueId] = 1;
        }
    
      });
    
      let outputLeagues = [];
      for (const [leagueId, numFixtures] of Object.entries(leagues)) {
        const league = await League.findById(leagueId);
        outputLeagues.push({
          league: league.leagueName,
          leagueId: league._id,
          numFixtures: numFixtures
        });
      }
      res.render('atamalar/hakemAtamadeneme', {
        referee:referee,
        leagues: outputLeagues,
        start,end, 
      });
  }
} catch (error) {
    console.error(error);
  }
});


router.get('/:id/hakem/groupSearch', async (req, res) => {
  try {
    const { dateSearchBegin, dateSearchFinal, leagueId} = req.query;
    let start = new Date(dateSearchBegin);
    let end = new Date(dateSearchFinal);

      const referee = await Post.findById(req.params.id).lean();
  
      const fixtures = await Fixture.find({
        $and: [
          {
            derbyDate: {
              $gte: new Date(start),
              $lte: new Date(end)
            },
            leagueId:leagueId,
          }
        ],
        $or: [
          { middleReferee: referee._id },
          { linemanReferee: referee._id },
          { secondLinemanReferee: referee._id },
          { fourthReferee: referee._id },
          { varReferee: referee._id },
          { secondVarReferee: referee._id }
        ]
      });
    
      let groups = {};
    
      fixtures.forEach(fixture => {

    
        if (fixture.groupId in groups) {
          groups[fixture.groupId]++;
        } else {
          groups[fixture.groupId] = 1;
        }
    
      });
    
      let outputGroups = [];
    for (const [groupId, numFixtures] of Object.entries(groups)) {
      const group = await Group.findById(groupId).populate({path:"leagueName", model: League}).lean();
      outputGroups.push({
        leagueName: group.leagueName,
        group: group._id,
        numFixtures: numFixtures
      });
    }
      res.render('atamalar/hakemAtamadeneme', {
        referee:referee,
        groups: outputGroups,
        start,end
      });
} catch (error) {
    console.error(error);
  }
});

router.get('/:id/hakem/matchSearch', async (req, res) => {
  try {
    const { dateSearchBegin, dateSearchFinal, groupId} = req.query;
    let start = new Date(dateSearchBegin);
    let end = new Date(dateSearchFinal);

      const referee = await Post.findById(req.params.id).lean();
  
      const fixtures = await Fixture.find({
        $and: [
          {
            derbyDate: {
              $gte: new Date(start),
              $lte: new Date(end)
            },
            groupId:groupId,
          }
        ],
        $or: [
          { middleReferee: referee._id },
          { linemanReferee: referee._id },
          { secondLinemanReferee: referee._id },
          { fourthReferee: referee._id },
          { varReferee: referee._id },
          { secondVarReferee: referee._id }
        ]
      });
    
      let teams = {};
    
      fixtures.forEach(fixture => {

    
        const homeTeamId = fixture.homeTeam;
      const awayTeamId = fixture.awayTeam;
  
      if (homeTeamId in teams) {
        teams[homeTeamId]++;
      } else {
        teams[homeTeamId] = 1;
      }
  
      if (awayTeamId in teams) {
        teams[awayTeamId]++;
      } else {
        teams[awayTeamId] = 1;
      }
    
      });
    
      let outputTeams = [];
      for (const [teamId, numFixtures] of Object.entries(teams)) {
        const team = await Team.findById(teamId);
        outputTeams.push({
          team: team.teamName,
          numFixtures: numFixtures
        });
      }
      res.render('atamalar/hakemAtamadeneme', {
        referee:referee,
        teams: outputTeams,
        start,end
      });
} catch (error) {
    console.error(error);
  }
});

//hakem detayı
router.get("/hakems/:id",async (req,res) =>{
  try {
    const referee = await Post.findById(req.params.id).lean();
  
    const fixtures = await Fixture.find({
      $or: [
        { middleReferee: referee._id },
        { linemanReferee: referee._id },
        { secondLinemanReferee: referee._id },
        { fourthReferee: referee._id },
        { varReferee: referee._id },
        { secondVarReferee: referee._id }
      ]
    });
  
    let groups = {};
    let leagues = {};
    let teams = {};
  
    fixtures.forEach(fixture => {
      // Grup bilgisi
      if (fixture.groupId in groups) {
        groups[fixture.groupId]++;
      } else {
        groups[fixture.groupId] = 1;
      }
  
      // Lig bilgisi
      if (fixture.leagueId in leagues) {
        leagues[fixture.leagueId]++;
      } else {
        leagues[fixture.leagueId] = 1;
      }
  
      // Takım bilgisi
      const homeTeamId = fixture.homeTeam;
      const awayTeamId = fixture.awayTeam;
  
      if (homeTeamId in teams) {
        teams[homeTeamId]++;
      } else {
        teams[homeTeamId] = 1;
      }
  
      if (awayTeamId in teams) {
        teams[awayTeamId]++;
      } else {
        teams[awayTeamId] = 1;
      }
    });
  
    let outputGroups = [];
    for (const [groupId, numFixtures] of Object.entries(groups)) {
      const group = await Group.findById(groupId).populate({path:"leagueName", model: League}).lean();
      outputGroups.push({
        leagueName: group.leagueName,
        group: group._id,
        numFixtures: numFixtures
      });
    }
  
    let outputLeagues = [];
    for (const [leagueId, numFixtures] of Object.entries(leagues)) {
      const league = await League.findById(leagueId);
      outputLeagues.push({
        league: league.leagueName,
        numFixtures: numFixtures
      });
    }
  
    let outputTeams = [];
    for (const [teamId, numFixtures] of Object.entries(teams)) {
      const team = await Team.findById(teamId);
      outputTeams.push({
        team: team.teamName,
        numFixtures: numFixtures
      });
    }

    let totalFixtures = 0;
for (const [groupId, numFixtures] of Object.entries(groups)) {
  totalFixtures += numFixtures;
}
  
    res.render('atamalar/hakemAtamadeneme', {
      referee:referee,
      groups: outputGroups,
      leagues: outputLeagues,
      teams: outputTeams,
      totalFixtures: totalFixtures

    });
  } catch (err) {
    console.log(err);
    res.send('An error occurred');
  }  
  })

router.get("/hakem",async (req,res) =>{
    res.render("atamalar/hakemAtama")
})

router.post("/fikstur/matchDate",async (req,res) =>{
    const X = new Date(req.body.dateSearchBegin); // set your date range
    const Y = new Date(req.body.dateSearchFinal);

    const countTotalMatch = await Fixture.countDocuments({
        $and: [
            {
              derbyDate: {
                $gte: new Date(X),
                $lte: new Date(Y)
              }
            },
            {
              $or: [
                { secondVarReferee: null },
                { varReferee: null },
                { fourthReferee: null },
                { middleReferee: null },
                { linemanReferee: null },
                { secondLinemanReferee: null },
              ]
            }
          ]
    })

    const countMatchReferee = await Fixture.countDocuments({
        $and: [
            {
              derbyDate: {
                $gte: new Date(X),
                $lte: new Date(Y)
              }
            },
            {
              $or: [
                { secondVarReferee:  { $ne: null } },
                { varReferee:  { $ne: null } },
                { fourthReferee:  { $ne: null } },
                { middleReferee:  { $ne: null } },
                { linemanReferee:  { $ne: null } },
                { secondLinemanReferee:  { $ne: null } },
              ]
            }
          ]
    });
    const countMatch = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        middleReferee: null,
        secondVarReferee: null,
        secondLinemanReferee: null,
        fourthReferee: null,
        varReferee: null,
        secondVarReferee: null,

    });

    const countSecondVarReferee = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        secondVarReferee: { $ne: null },
    });

    // Count the number of fixtures where secondVarReferee is null
    const countSecondVarRefereeNull = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        secondVarReferee: null
    });

    const countVarReferee = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        VarReferee: { $ne: null },
    });

    // Count the number of fixtures where varReferee is null
    const countVarRefereeNull = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        varReferee: null
    });

    const countFourthReferee = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        fourthReferee: { $ne: null },
    });

    // Count the number of fixtures where fourthReferee is null
    const countFourthRefereeNull = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        fourthReferee: null
    });

    const countMiddleReferee = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        middleReferee: { $ne: null },
    });


    // Count the number of fixtures where middleReferee is null
    const countMiddleRefereeNull = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        middleReferee: null
    });

    const countLinemanReferee = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        linemanReferee: { $ne: null },
    });

    // Count the number of fixtures where linemanReferee is null
    const countLinemanRefereeNull = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        linemanReferee: null
    });

    const countSecondLinemanReferee = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        secondLinemanReferee: { $ne: null },
    });

    // Count the number of fixtures where secondLinemanReferee is null
    const countSecondLinemanRefereeNull = await Fixture.countDocuments({
        derbyDate: {
            $gte: new Date(X),
            $lte: new Date(Y)
        },
        secondLinemanReferee: null
    });

    Fixture.find({
        $and: [
            {
              derbyDate: {
                $gte: new Date(X),
                $lte: new Date(Y)
              }
            },
            {
              $or: [
                { secondVarReferee: null },
                { varReferee: null },
                { fourthReferee: null },
                { middleReferee: null },
                { linemanReferee: null },
                { secondLinemanReferee: null },
              ]
            }
          ]
    }).populate({path:"homeTeam", model: Team}).populate({path:"awayTeam", model: Team}).lean().then(fixture =>{
        Referee.find({}).lean().then(referee =>{
            res.render("atamalar/fiksturAtama", {
                fixture:fixture,
                referee:referee,
                countMatch:countMatch,
                countSecondVarRefereeNull: countSecondVarRefereeNull,
                countVarRefereeNull: countVarRefereeNull,
                countFourthRefereeNull: countFourthRefereeNull,
                countMiddleRefereeNull: countMiddleRefereeNull,
                countLinemanRefereeNull: countLinemanRefereeNull,
                countSecondVarReferee:countSecondVarReferee,
                countTotalMatch:countTotalMatch,
                countMatchReferee:countMatchReferee,
                countSecondLinemanRefereeNull: countSecondLinemanRefereeNull,
                sumReferee:countSecondVarReferee+countVarReferee+countFourthReferee+countLinemanReferee+countMiddleReferee+countSecondLinemanReferee,
                sumRefereeNull:countSecondVarRefereeNull+countVarRefereeNull+countFourthRefereeNull+countLinemanRefereeNull+countMiddleRefereeNull+countSecondLinemanRefereeNull
            });
        })
    })
})



// Maçı olan hakemlerin listesi
router.post("/hakem/matchDate", async (req, res) => {
    const { dateSearchBegin, dateSearchFinal } = req.body;
    
    try {
      const fixtures = await Fixture.find({
        derbyDate: { $gte: dateSearchBegin, $lte: dateSearchFinal }
      });
  
      const refereeIds = fixtures.flatMap((fixture) => [
        fixture.middleReferee,
        fixture.linemanReferee,
        fixture.secondLinemanReferee,
        fixture.fourthReferee,
        fixture.varReferee,
        fixture.secondVarReferee
      ]);
  
      const refereeMatchCounts = await Referee.aggregate([
        { $match: { _id: { $in: refereeIds } } },
        {
          $lookup: {
            from: "fixtures",
            let: { refereeId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$middleReferee", "$$refereeId"] },
                      { $eq: ["$linemanReferee", "$$refereeId"] },
                      { $eq: ["$secondLinemanReferee", "$$refereeId"] },
                      { $eq: ["$fourthReferee", "$$refereeId"] },
                      { $eq: ["$varReferee", "$$refereeId"] },
                      { $eq: ["$secondVarReferee", "$$refereeId"] }
                    ]
                  }
                }
              }
            ],
            as: "refereeMatches"
          }
        },
        {
          $addFields: {
            matchCount: { $size: "$refereeMatches" }
          }
        },
        { $project: { refereeMatches: 0 } }
      ]);
  
      const refereesWithMatchCount = refereeMatchCounts.map((refereeMatchCount) => ({
        ...refereeMatchCount,
        referee: refereeMatchCount._id
      }));
  
      const totalRefereeCount = refereesWithMatchCount.length;
      const noMatchRefereeCount = refereesWithMatchCount.filter((referee) => {
        return !referee.matchCount;
      }).length;
      const overTenMatchesRefereeCount = refereesWithMatchCount.filter((referee) => {
        return referee.matchCount > 10;
      }).length;
      const totalMatchCount = refereesWithMatchCount.reduce((acc, referee) => {
        return acc + referee.matchCount;
      }, 0);
      const totalRefereeWithMatchCount = refereesWithMatchCount.filter((referee) => {
        return referee.matchCount > 0;
      }).length;
                  
      const refereesWithMatches = await Referee.populate(refereesWithMatchCount, { path: "referee" });
  
      const refereesWithMatchesFiltered = refereesWithMatches.filter((refereeWithMatchCount) => refereeWithMatchCount.matchCount > 0);
  
      const sortedReferees = refereesWithMatchCount.sort((a, b) => b.matchCount - a.matchCount).slice(0, 5);
      const sortedNegativeReferees = refereesWithMatchCount.sort((a, b) => a.matchCount - b.matchCount).slice(0, 5);
      const totalSortedMatchCount = sortedReferees.reduce((acc, referee) => {
        return acc + referee.matchCount;
      }, 0);
      const totalNegativeMatchCount = sortedNegativeReferees.reduce((acc, referee) => {
        return acc + referee.matchCount;
      }, 0);

      const refereeGroups = {};
fixtures.forEach((fixture) => {
  const referees = [
    fixture.middleReferee,
    fixture.linemanReferee,
    fixture.secondLinemanReferee,
    fixture.fourthReferee,
    fixture.varReferee,
    fixture.secondVarReferee
  ];

  referees.forEach((referee) => {
    const group = fixture.group;
    if (!refereeGroups[referee]) {
      refereeGroups[referee] = {};
    }

    if (!refereeGroups[referee][group]) {
      refereeGroups[referee][group] = 1;
    } else {
      refereeGroups[referee][group]++;
    }
  });
});

Object.entries(refereeGroups).forEach(([refereeId, groups]) => {
  console.log(`Referee ${refereeId}:`);
  Object.entries(groups).forEach(([group, count]) => {
    console.log(`- Group ${group}: ${count} matches`);
  });
});


      res.render('atamalar/hakemAtama', { refereesWithMatches,sortedReferees,sortedNegativeReferees,totalSortedMatchCount,totalNegativeMatchCount,totalRefereeCount,overTenMatchesRefereeCount,noMatchRefereeCount,totalRefereeWithMatchCount});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  



module.exports = router