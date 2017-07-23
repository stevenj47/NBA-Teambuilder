const mongoose = require('mongoose');
const config = require('../config/database');

const Schema = mongoose.Schema;

const RotationsSchema = Schema ({
	minutes: {
		pg: [{
			name: {
				type: String
			},
			minute_start: {
				type: Number
			},
			minute_end: {
				type: Number
			} 
		}],
		sg: [{
			name: {
				type: String
			},
			minute_start: {
				type: Number
			},
			minute_end: {
				type: Number
			} 		
		}],
		sf: [{
			name: {
				type: String
			},
			minute_start: {
				type: Number
			},
			minute_end: {
				type: Number
			} 	
		}],
		pf: [{
			name: {
				type: String
			},
			minute_start: {
				type: Number
			},
			minute_end: {
				type: Number
			} 
		}],
		c: [{
			name: {
				type: String
			},
			minute_start: {
				type: Number
			},
			minute_end: {
				type: Number
			} 
		}]
	}
});

const Rotations = module.exports = mongoose.model('Rotations', RotationsSchema);

module.exports.getRotationById = function(id, callback) {
	Rotations.findById(id, callback);
}

module.exports.addRotations = function(newRotation, callback) {
	newRotation.save(callback);
}