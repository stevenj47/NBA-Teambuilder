import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  validateRegister(user) {
  	if(user.name == undefined || user.email == undefined || user.username == undefined || user.password == undefined) {
  		return false
  	}
  	else {
  		return true;
  	}
  }

  validateTeam(team) {
    if(team.city == undefined || team.name == undefined || team.abbr == undefined) {
      return false;
    }
    else {
      return true;
    }
  }

  validateMatchTeams(team1, team2) {
    if(team1.city == undefined || team1.name == undefined || team1.abbr == undefined) {
      return false;
    }

    if(team2.city == undefined || team2.name == undefined || team2.abbr == undefined) {
      return false;
    }

    if(team1.name == team2.name && team1.city == team2.city && team1.abbr == team2.abbr) {
      return false;
    }

    const starters1 = team1.teamPlayers.starters;
    const starters2 = team2.teamPlayers.starters;

    if(!starters1.pg.id || !starters1.sg.id || !starters1.sf.id || !starters1.pf.id || !starters1.c.id) {
      return false;
    }

    if(!starters2.pg.id || !starters2.sg.id || !starters2.sf.id || !starters2.pf.id || !starters2.c.id) {
      return false;
    }

    return true;
  }
  
  validateEmail(email) {
  	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
}
