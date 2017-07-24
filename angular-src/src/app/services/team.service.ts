import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TeamService {
  public selectedTeam1: any;
  public selectedTeam2: any;

  constructor(private http:Http) { }

  addTeam(team) {
    let headers = new Headers();
    headers.append('Content-Type','application/json');
    
    return this.http.post('http://localhost:3000/teams/create', team, {headers: headers})
      .map(res => res.json());
  }

  addPlayerToTeam(info) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post('http://localhost:3000/teams/add_player', info, {headers: headers})
      .map(res => res.json());
  }

  addPlayerToRotation(info) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post('http://localhost:3000/teams/add_player_rotation', info, {headers: headers})
      .map(res => res.json());
  }

  removePlayerFromRotation(info) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post('http://localhost:3000/teams/remove_player_rotation', info, {headers: headers})
      .map(res => res.json());
  }

  retrieveTeams(tids) {
  	let headers = new Headers();
  	headers.append('Content-Type', 'application/json');
  	return this.http.post('http://localhost:3000/teams/user_teams', tids, {headers: headers})
      .map(res => res.json());
  }

  retrieveTeamPlayers(team) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/teams/team_players', team, {headers: headers})
      .map(res => res.json());
  }
}
