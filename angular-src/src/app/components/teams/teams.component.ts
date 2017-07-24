import { AfterViewInit, Component, Directive, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { PlayerService } from '../../services/player.service';
import { ModalComponent } from '../modal/modal.component';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  @ViewChild('modal1') playerModal: ModalComponent
  @ViewChild('modal2') minuteModal: ModalComponent

  playername: string;
  selectedSeason: number;
  selectedPosition: string;
  selectedPlayerName: string;
  seasons: string[];
  positions: string[];
  starter_pos: string[];
  playerData: any;
  currentSeasonStats: any;
  team: any;
  team_starters: Object;
  team_rotations: Object;
  team_bench: any[];
  team_arr: any[];
  min_start: number;
  min_end: number;

  constructor(
    private playerService : PlayerService,
    private router : Router,
    private flashMessage : FlashMessagesService,
    private teamService: TeamService
  ) { }

  ngOnInit() {
    this.team = this.teamService.selectedTeam1;
    this.teamService.retrieveTeamPlayers(this.team).subscribe(data => {
      if(data.success) {
        this.team_starters = data.team_info.starters;
        this.team_bench = data.team_info.bench;
        this.team_rotations = data.team_info.rotations;

        this.team_arr = Object.keys(data.team_info.starters).map(function(k) { 
          return data.team_info.starters[k];
        });

        this.team_arr = this.team_arr.concat(data.team_info.bench);
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    });

    this.selectedSeason = 0;
    this.selectedPosition = "PG";
    this.selectedPlayerName = "";
    this.seasons = [];
    this.positions = ['PG', 'SG', 'SF', 'PF', 'C', 'Bench'];
    this.starter_pos = ['PG', 'SG', 'SF', 'PF', 'C'];
    this.min_start = 0;
    this.min_end = 48;
  }

  ngAfterViewInit() {
    this.playerModal;
  }

  onChange(newObj) {
    console.log(newObj);
    this.currentSeasonStats = this.playerData.seasonStats[this.selectedSeason];
  }

  addMinutes() {
    console.log(this.selectedPlayerName, this.selectedPosition, this.min_start, this.min_end);
    this.minuteModal.hide();

    const info = {
      teamID: this.team._id,
      playerName: this.selectedPlayerName,
      pos: this.selectedPosition,
      min_start: this.min_start,
      min_end: this.min_end
    };

    this.teamService.addPlayerToRotation(info).subscribe(data => {
      if(data.success) {
        this.team_rotations = data.rotation;
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    })
  }

  addPlayer() {
    if(this.selectedPosition === 'Bench') {
      this.team_bench.push({
        name: this.playerData.name,
        playerID: this.playerData.playerID,
        seasonStat: this.playerData.seasonStats[this.selectedSeason]
      });
    } else {
      this.team_starters[this.selectedPosition.toLowerCase()] = {
        name: this.playerData.name,
        playerID: this.playerData.playerID,
        seasonStat: this.playerData.seasonStats[this.selectedSeason]
      }
    }

    this.playerModal.hide();

    let team_player_info = {
      tid: this.team._id,
      pid: this.playerData._id,
      position: this.selectedPosition,
      season: this.selectedSeason
    };

    this.teamService.addPlayerToTeam(team_player_info).subscribe(data => {
      if(!data.success) {  
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    });
  }

  removeFromRot(rot, pos) {
    const info = {
      teamID: this.team._id,
      pos: pos,
      rot: rot
    };

    this.teamService.removePlayerFromRotation(info).subscribe(data => {
      if(data.success) {
        this.team_rotations = data.rotation;
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    });
  }

  onPlayerNameSubmit() {
    const Player = {
      playername: this.playername
    }

    this.playerService.getPlayerInfo(Player).subscribe(data => {
      if(data.success) {
        this.playerData = data.player;
        this.selectedSeason = 0;
        this.seasons = [];
        this.currentSeasonStats = this.playerData.seasonStats[this.selectedSeason];
        for(var season_name of data.player.seasonStats) {
          this.seasons.push(season_name.season);
        }
        this.playerModal.show();
      } else {
        this.flashMessage.show("Player not found.", {cssClass: 'alert-danger', timeout: 3000});
        this.router.navigate(['/teams']);
      }
    });
  }

}
