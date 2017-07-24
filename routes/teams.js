const express = require('express');
const async = require('async');
const router = express.Router();

const Team = require('../models/teams');
const User = require('../models/user');
const Player = require('../models/player');
const Rotations = require('../models/rotations');
const config = require('../config/database');

router.post('/create', function(req, res, next) {
  let newRotation = new Rotations({
    minutes: {
      pg: [],
      sg: [],
      sf: [],
      pf: [],
      c: []
    }
  });

  let newTeam = new Team({
    city: req.body.city,
    name: req.body.name,
    abbr: req.body.abbr,
    rotations: null,
    teamPlayers: {
      starters: {
        pg: {id: null, season: null},
        sg: {id: null, season: null},
        sf: {id: null, season: null},
        pf: {id: null, season: null},
        c: {id: null, season: null},
      },
      bench: []
    }
  });

  const uid = req.body.uid;

  User.getUserById(uid, function(err, current_user) {
    if(err) throw err;

    if(!current_user) {
      return res.json({success: false, msg: 'User not found!'});
    }

    Team.addTeam(newTeam, function(err, team) {
      if(err) {
        return res.json({success: false, msg: 'Failed to create team'});
      } else {
        User.addTeamToUser(current_user, team, function(err, user) {
          if(err) {
            return res.json({success: false, msg: 'Failed to add team'});
          } else {
            Rotations.addRotations(newRotation, function(err, rotation) {
              if(err) {
                return res.json({success: false, msg: 'Failed to create rotations'});
              } else {
                Team.addRotationToTeam(team, rotation, function(err, rteam) {
                  if(err) throw err;

                  return res.json({success: true, team: rteam, msg: 'Team created!'});
                })
              }
            });
          }
        });     
      }
    });
  })  
});

router.post('/add_player', function(req, res, next) {
  const teamID = req.body.tid;
  const playerID = req.body.pid;
  const pos = req.body.position.toLowerCase();
  const season = req.body.season;

  console.log(req.body);

  Team.getTeamById(teamID, function(err, team) {
    if(err) throw err;

    if(!team) {
      res.json({success: false, msg: 'Team not found!'});
    }

    if(pos === 'bench') {
      Team.addPlayerToBench(team, playerID, season, function(err, team) {
        if(err) {
          return res.json({success: false, msg: 'Failed to add player to team'});
        } else {
          return res.json({success: true, team: team, msg: 'Player added to team'});
        }
      });
    } else {
      Team.addPlayerToStarters(team, pos, playerID, season, function(err, team) {
        if(err) {
          return res.json({success: false, msg: 'Failed to add player to team'});
        } else {
          return res.json({success: true, team: team, msg: 'Player added to team'});
        }
      });
    }
  })
});

router.post('/add_player_rotation', function(req, res, next) {
  const teamID = req.body.teamID;
  const playerName = req.body.playerName;
  const pos = req.body.pos.toLowerCase();
  const min_start = req.body.min_start;
  const min_end = req.body.min_end;

  Team.getTeamById(teamID, function(err, team) {
    if(err) {
      return res.json({success: false, msg: 'Failed to retrieve team'});
    }

    Rotations.getRotationById(team.rotations, function(err, rotation) {
      if(err) {
        return res.json({success: false, msg: 'Failed to retrieve rotation'});
      }

      rotation.minutes[pos].push({
        name: playerName,
        minute_start: min_start,
        minute_end: min_end
      });

      rotation.minutes[pos].sort(function(p1, p2) { return p1.minute_end - p2.minute_end});

      Rotations.addRotations(rotation, function(err, rotation) {
        if(err) throw err;

        return res.json({success: true, rotation: rotation, msg: 'Player added to rotation'});
      });
    });
  });
});

router.post('/remove_player_rotation', function(req, res, next) {
  const teamID = req.body.teamID;
  const pos = req.body.pos.toLowerCase();
  const remove_rot = req.body.rot;

  Team.getTeamById(teamID, function(err, team) {
    if(err) {
      return res.json({success: false, msg: 'Failed to retrieve team'});
    }

    Rotations.getRotationById(team.rotations, function(err, rotation) {
      if(err) {
        return res.json({success: false, msg: 'Failed to retrieve rotation'});
      }

      rotation.minutes[pos] = rotation.minutes[pos].filter(function(element) {
        return element._id != remove_rot._id;
      });

      Rotations.addRotations(rotation, function(err, new_rotation) {
        if(err) throw err;

        return res.json({success: true, rotation: new_rotation, msg: 'Player added to rotation'});
      });
    });
  });
});


router.post('/team_players', function(req, res, next) { 
  const starters = req.body.teamPlayers.starters;
  const bench = req.body.teamPlayers.bench;
  const rotationID = req.body.rotations;

  let team_info = {
    starters : {},
    bench: [],
    rotations: {}
  };

  var benchMapFunc = function(bid, callback) {
    Player.getPlayerByIdWithSeason(bid, callback);
  };

  async.parallel({
    pg: function(callback) {
      if(starters.pg.id) {
        Player.getPlayerByIdWithSeason(starters.pg, callback);
      } else {
        callback(null, null);
      }
    },
    sg: function(callback) {
      if(starters.sg.id) {
        Player.getPlayerByIdWithSeason(starters.sg, callback);
      } else {
        callback(null, null);
      }
    },
    sf: function(callback) {
      if(starters.sf.id) {
        Player.getPlayerByIdWithSeason(starters.sf, callback);
      } else {
        callback(null, null);
      }
    },
    pf: function(callback) {
      if(starters.pf.id) {
        Player.getPlayerByIdWithSeason(starters.pf, callback);
      } else {
        callback(null, null);
      }
    },
    c: function(callback) {
      if(starters.c.id) {
        Player.getPlayerByIdWithSeason(starters.c, callback);
      } else {
        callback(null, null);
      }
    }
  }, function(err, starter_results) {
    if(err) {
      res.json({success: false, msg: 'Failed to retrieve starters'});
    }

    team_info.starters = starter_results;

    async.map(bench, benchMapFunc, function(err, bench_results) {     
      if(err) {
        res.json({success: false, msg: 'Failed to retrieve bench players'});
      }

      team_info.bench = bench_results;
      
      Rotations.getRotationById(rotationID, function(err, rotation) {
        if(err) {
          res.json({success: false, msg: 'Failed to retrieve rotations'});
        }

        team_info.rotations = rotation;
        res.json({success: true, team_info: team_info, msg: 'Retrieved player info'});
      });
    })
  });

});

router.post('/update', function(req, res, next) {
  const tid = req.body.team_id;
  const updated_team = req.body.updated_team;

  Team.getTeamById(tid, function(err, team) {
    if(err) throw err;

    if(!team) {
      res.json({success: false, msg: 'Team not found!'});
    }

    console.log(updated_team);
  });
});

router.post('/user_teams', function(req, res, next) {
  const tids = req.body;

  let teams = [];
  let tid;

  for(tid of tids) {
    Team.getTeamById(tid, function(err, team) {
      if(err) throw err;

      if(!team) {
        return res.json({success: false, msg: 'Error retrieving team!'});
      }
      teams.push(team);

      if(teams.length == tids.length) {
        return res.json({success:true, teams: teams});
      }
    })
  } 
  
});

module.exports = router;