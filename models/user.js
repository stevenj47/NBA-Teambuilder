const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const Schema = mongoose.Schema;

const UserSchema = Schema({
	name: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	teams: [{ 
		type: Schema.Types.ObjectId, 
		ref: 'Team' 
	}]
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
	const query = {username: username};
	User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			if(err) throw err;
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.addTeamToUser = function(current_user, team, callback) {
	current_user.teams.push(team);
	current_user.save(callback);
}

module.exports.comparePassword = function(inputPass, hash, callback) {
	bcrypt.compare(inputPass, hash, function(err, isMatch) {
		if(err) throw err;
		callback(err, isMatch);
	})
}