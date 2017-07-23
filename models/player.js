const mongoose = require('mongoose');
const config = require('../config/database');

const PlayerSchema = mongoose.Schema({
	name: {
		type: String
	},
	playerID: {
		type: Number
	},
	seasonStats: [{
		season: String,
		age: Number,
		gp: Number,
		gs: Number,
		mins: Number,
		pts: Number,
		rebs: Number,
		asts: Number,
		stls: Number,
		blks: Number,
		tovs: Number,
		pfs: Number,
		fgPct: Number,
		fg3Pct: Number,
		ftPct: Number
	}]
});

const Player = module.exports = mongoose.model('Player', PlayerSchema);

module.exports.getPlayerById = function(id, callback) {
	Player.findById(id, callback);
}

module.exports.getPlayerByIdWithSeason = function(player_info, callback) {
	Player.findById(player_info.id, function(err, player) {
		if(err) {
			callback(err, player);
		} else {
			const seasonPlayer = {
				name: player.name,
				playerID: player.playerID,
				seasonStat: player.seasonStats[player_info.season]
			};

			callback(null, seasonPlayer);
		};
	})
}

module.exports.getPlayerByPID = function(pid, callback) {
	const query = { playerID : pid };
	Player.findOne(query, callback);
}

module.exports.addPlayer = function(newPlayer, callback) {
	newPlayer.save(callback);
}
