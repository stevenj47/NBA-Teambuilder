const express = require('express');
const NBA = require('nba');
const router = express.Router();

const PlayerModel = require('../models/player');
const config = require('../config/database');

router.post('/find', function(req, res, next) {
	const player = NBA.findPlayer(req.body.playername);
	if(player) {
		console.log(player);

		PlayerModel.getPlayerByPID(player.playerId, function(err, playerData) {
			if(err) throw err;

			if(playerData) {
				console.log("Player is found");
				return res.json({success: true, player: playerData});
			} else {
				// Create the player and insert into database
				const playerInfo = NBA.stats.playerProfile({ PlayerID: player.playerId });
				console.log(playerInfo);
				playerInfo.then(function(data) {
										
					var newPlayer = new PlayerModel({
						name: player.fullName,
						playerID: player.playerId,
						seasonStats: []
					});

					var prevSeason;

					for(var season in data.seasonTotalsRegularSeason) {
						var seasonData = data.seasonTotalsRegularSeason[season];
						var seasonInfo = {					
							season: seasonData.seasonId,
							age: seasonData.playerAge,
							gp: seasonData.gp,
							gs: seasonData.gs,
							mins: seasonData.min,
							pts: seasonData.pts,
							rebs: seasonData.reb,
							asts: seasonData.ast,
							stls: seasonData.stl,
							blks: seasonData.blk,
							tovs: seasonData.tov,
							pfs: seasonData.pf,
							fgPct: seasonData.fgPct,
							fg3Pct: seasonData.fg3Pct,
							ftPct: seasonData.ftPct
						};

						if(prevSeason) {
							if(prevSeason.season != seasonInfo.season) {
								newPlayer.seasonStats.push(prevSeason);
							}
						}
						
						prevSeason = seasonInfo;
					}

					newPlayer.seasonStats.push(prevSeason);

					PlayerModel.addPlayer(newPlayer, function(err, user) {
						if(err) {
							res.json({success: false, msg: 'Failed to add player'});
						} else {
							res.json({success: true, player: newPlayer});
						}
					});
				});
			}
		});	
	} else {
		return res.json({success: false, msg: 'Player does not exist'});
	}
});

module.exports = router;