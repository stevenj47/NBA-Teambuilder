const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const request = require('request');
const cheerio = require('cheerio');
const NBA = require('nba');
const config = require('./config/database');

const app = express();

const users = require('./routes/users');
const players = require('./routes/players');
const teams = require('./routes/teams');

const port = 3000;

// Connect to database
mongoose.connect(config.database);

mongoose.connection.on('connected', function() {
	console.log('Connected to database ' + config.database);
})

mongoose.connection.on('error', function(err) {
	console.log('Error: ' + err);
})

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Enable cors middleware
app.use(cors());

// Enable body parse middleware
app.use(bodyParser.json());

// Set up passport JWT Strategy
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);

app.use('/players', players);

app.use('/teams', teams);

app.get('/', function(req, res) {
	res.send("Invalid endpoint!");
});

app.get('*', (req, res) => {
	  res.sendFile(path.join(__dirname, 'public/index.html'));	
});

app.listen(port, function() {
	console.log("Server started on port " + port);
});

