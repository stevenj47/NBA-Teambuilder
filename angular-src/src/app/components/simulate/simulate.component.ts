import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-simulate',
  templateUrl: './simulate.component.html',
  styleUrls: ['./simulate.component.css']
})
export class SimulateComponent implements OnInit {

  match_team1: any;
  match_team2: any;
  team1_info: any;
  team2_info: any;
  team1_period: any;
  team2_period: any;
  period_length: number;
  current_time: number;
  secs_counter: number;
  team_switch: bool;
  made_shot: bool;
  team1_lineup: {};
  team2_lineup: {};


  constructor(
    private teamService: TeamService,
    private flashMessage:FlashMessagesService
  ) { }

  ngOnInit() {
    this.match_team1 = this.teamService.selectedTeam1;
    this.match_team2 = this.teamService.selectedTeam2;

    this.team1_period = {
      name: "",
      minute_start: 0,
      minute_end: 0
    };

    this.team2_period = {
      name: "",
      minute_start: 0,
      minute_end: 0
    };

    this.team1_lineup = {
      pg: {},
      sg: {},
      sf: {},
      pf: {},
      c: {}
    };

    this.team2_lineup = {
      pg: {},
      sg: {},
      sf: {},
      pf: {},
      c: {}
    };

    this.teamService.retrieveTeamPlayers(this.match_team1).subscribe(data => {
      if(data.success) {

        let player_arr = Object.keys(data.team_info.starters).map(function(k) { 
          return data.team_info.starters[k];
        });

        player_arr = player_arr.concat(data.team_info.bench);

        this.team1_info = {
          players: player_arr,
          rotations: data.team_info.rotations
        };
        
        this.team1_lineup = this.fillLineup(this.team1_period, this.team1_info, this.team1_lineup);
        this.calculateTeamRotationEnd(this.team1_info, this.team1_period, true);
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    }); 

    this.teamService.retrieveTeamPlayers(this.match_team2).subscribe(data => {
      if(data.success) {
        let player_arr = Object.keys(data.team_info.starters).map(function(k) { 
          return data.team_info.starters[k];
        });

        player_arr = player_arr.concat(data.team_info.bench);

        this.team2_info = {
          players: player_arr,
          rotations: data.team_info.rotations
        };

        this.team2_lineup = this.fillLineup(this.team2_period, this.team2_info, this.team2_lineup);
        this.calculateTeamRotationEnd(this.team2_info, this.team2_period, false);
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    });

    this.current_time = 0;
    this.secs_counter = 0.0;
    this.team_switch = false;
    this.made_shot = false;
  }

  startSimulation() {
    while(this.current_time < 48) {
      if(this.team1_period.minute_end <= this.current_time) {
        console.log('Substitution for Team 1 at: ', this.team1_period.minute_end);
        this.team1_lineup = this.fillLineup(this.team1_period, this.team1_info, this.team1_lineup);
        this.calculateTeamRotationEnd(this.team1_info, this.team1_period, true);
      }

      if(this.team2_period.minute_end <= this.current_time) {
        console.log('Substitution for Team 2 at: ', this.team2_period.minute_end); 
        this.team2_lineup = this.fillLineup(this.team2_period, this.team2_info, this.team2_lineup);
        this.calculateTeamRotationEnd(this.team2_info, this.team2_period, false); 
      }

      this.simulateMin(false);

      this.current_time += 1;
    }
  }

  simulateMin() {
    let weightPtsTeam1 = 0.0;
    let weightRbsTeam1 = 0.0;

    let weightPtsTeam2 = 0.0;
    let weightRbsTeam2 = 0.0;

    for(let key of Object.keys(this.team1_lineup)) {
      weightPtsTeam1 += this.team1_lineup[key].seasonStat.pts/this.team1_lineup[key].seasonStat.mins;
      weightRbsTeam1 += this.team1_lineup[key].seasonStat.rebs/this.team1_lineup[key].seasonStat.mins;

      weightPtsTeam2 += this.team2_lineup[key].seasonStat.pts/this.team2_lineup[key].seasonStat.mins;
      weightRbsTeam2 += this.team2_lineup[key].seasonStat.rebs/this.team2_lineup[key].seasonStat.mins;
    }

    this.secs_counter = 0.0;

    while(this.secs_counter <= 60.0) {
      calculateScore();
    }
  }

  calculateScore() {
    let pos = ['pg', 'sg', 'sf', 'pf', 'c'];
    let prevKey = null;
    let pos_time = 3 + (Math.random() * 6);

    while(pos.length != 0) {
      let idx = Math.floor(Math.random() * pos.length);
      let key = pos[idx];
      pos.splice(idx, 1);

      let scoreTend = 0.0;
      let rebProb = 0.0;

      if(!team_switch) {
        scoreTend = this.team1_lineup[key].seasonStat.pts/this.team1_lineup[key].seasonStat.mins/weightPtsTeam1;
        rebProb = this.team1_lineup[key].seasonStat.rebs/this.team1_lineup[key].seasonStat.mins/weightRbsTeam1;
      } else {
        scoreTend = this.team2_lineup[key].seasonStat.pts/this.team2_lineup[key].seasonStat.mins/weightPtsTeam2;
        rebProb = this.team2_lineup[key].seasonStat.rebs/this.team2_lineup[key].seasonStat.mins/weightRbsTeam2;
      }

      let shootProb = Math.random();
      let scoreProb = Math.random();
      let reboundProb = Math.random();

      if(shootProb >= scoreTend && (24.0 - pos_time) >= 3.0) {
        if(prevKey != null) {
          pos.push(prevKey);
        }
        
        pos_time += 2.0;
        console.log(this.team1_lineup[key].name, " has passed the ball!");
      } else {
        if(scoreProb >= this.team1_lineup[key].seasonStat.fgPct) {
          console.log(this.team1_lineup[key].name, " shot and missed!");
          this.made_shot = false;
          break;
        } else {
          console.log(this.team1_lineup[key].name, " shot and made the shot!");

          if(prevKey != null) {
            console.log(this.team1_lineup[prevKey].name, " got an assist!");
          }
      
          this.made_shot = true;
          break;
        }
      }

      prevKey = key;
    }

    this.secs_counter += (pos_time + 1.0);
    this.team_switch = !this.team_switch;
  }

  calculateTeamRotationEnd(team_info, team_period, isTeam1) {
    this.period_length = 48;

    for(let key of Object.keys(team_info.rotations.minutes)) {
      for(let period of team_info.rotations.minutes[key]) {
        const diff = period.minute_end - team_period.minute_end;

        if(diff > 0 && diff <= this.period_length) {

          if(isTeam1) {
            this.team1_period = period;
          } else {
            this.team2_period = period;
          }

          this.period_length = diff;

        } else if(diff > 0 && diff > this.period_length){
          break;
        }
      }
    }
  }

  fillLineup(start_period, team_info, team_lineup) {
    for(let key of Object.keys(team_info.rotations.minutes)) {
      let period = team_info.rotations.minutes[key].find(function(rot) {
        return rot.minute_start == start_period.minute_end;
      });

      if(period) {
        console.log("Subbed ", team_lineup[key].name, " with ", period.name);
        team_lineup[key] = team_info.players.find(function(player) {
          return player.name === period.name;
        });
      } 
    }

    return team_lineup;
  }

}
