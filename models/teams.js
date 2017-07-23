const mongoose = require('mongoose');
const config = require('../config/database');

const Schema = mongoose.Schema;

const TeamSchema = Schema ({
	city: {
		type: String
	},
	name: {
		type: String
	},
	abbr: {
		type: String, 
	},
	rotations: {
		type: Schema.Types.ObjectId,
		ref: 'Rotations'
	},
	teamPlayers: {
		starters: {
			pg: { 
				id: {
					type: Schema.Types.ObjectId, 
					ref: 'Player'
				},
				season: {
					type: Number
				}
			},
			sg: { 
				id: {
					type: Schema.Types.ObjectId, 
					ref: 'Player'
				},
				season: {
					type: Number
				}
			},
			sf: { 
				id: {
					type: Schema.Types.ObjectId, 
					ref: 'Player'
				},
				season: {
					type: Number
				}
			},
			pf: { 
				id: {
					type: Schema.Types.ObjectId, 
					ref: 'Player'
				},
				season: {
					type: Number
				}
			},
			c: { 
				id: {
					type: Schema.Types.ObjectId, 
					ref: 'Player'
				},
				season: {
					type: Number
				}
			}
		},
		bench: [{
			id: { 
				type: Schema.Types.ObjectId, 
				ref: 'Player'
			},
			season: {
				type: Number
			}
		}]
	}
});

const Team = module.exports = mongoose.model('Team', TeamSchema);

module.exports.getTeamById = function(id, callback) {
	Team.findById(id, callback);
}

module.exports.addTeam = function(newTeam, callback) {
	newTeam.save(callback);
}

module.exports.addPlayerToBench = function(team, playerID, season, callback) {
	team.teamPlayers.bench.push({id: playerID, season: season});
	team.save(callback);
}

module.exports.addRotationToTeam = function(team, rotation, callback) {
	team.rotations = rotation._id;
	team.save(callback);
}

module.exports.addPlayerToStarters = function(team, pos, playerID, season, callback) {
	team.teamPlayers.starters[pos] = {
		id: playerID,
		season: season
	};
	
	console.log(team.teamPlayers.starters);

	team.save(callback);
}
