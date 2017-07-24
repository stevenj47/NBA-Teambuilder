import { AfterViewInit, Component, Directive, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(ModalComponent) createModal: ModalComponent

  name: String;
  city: String;
  abbr: String;
  user: any;
  teams: any[] = [];
  selectTeam1: any;
  selectTeam2: any;

  constructor(
  	private validateService: ValidateService,
  	private teamService: TeamService,
  	private authService:AuthService,
  	private flashMessage:FlashMessagesService,
    private router: Router) { }

  ngOnInit() {
    this.user = this.authService.getUser();

    this.teamService.retrieveTeams(this.user.teams).subscribe(data => {
      this.teams = data.teams;
      this.selectTeam1 = this.teams[0];
      this.selectTeam2 = this.teams[0];
    });
  }

  ngAfterViewInit() {
  }

  goToTeam(team) {
    this.teamService.selectedTeam1 = team;
    this.router.navigate(['/teams/details']);
  }

  createTeam() {
  	const team = {
  		city: this.city,
  		name: this.name,
  		abbr: this.abbr,
  		uid: this.user.id
  	};

  	this.createModal.hide();
  	if(!this.validateService.validateTeam(team)) {
  	  this.flashMessage.show("Please fill in all the fields", {cssClass: 'alert-danger', timeout: 3000});
      return false;
  	}

  	this.teamService.addTeam(team).subscribe(data => {
  		if(data.success) {
        this.user.teams.push(data.team._id);
        this.teams.push(data.team);
        this.authService.updateUserStorage(this.user);
  		} else {
  			console.log('Team not made!');
  		}
  	}); 	
  }

  simulate() {
    this.teamService.selectedTeam1 = this.selectTeam1;
    this.teamService.selectedTeam2 = this.selectTeam2;
    this.router.navigate(['/simulate_match']); 
  }
}
