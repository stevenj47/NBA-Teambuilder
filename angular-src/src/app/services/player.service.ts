import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PlayerService {

  constructor(private http:Http) { }

  getPlayerInfo(player) {
  	let headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post('http://localhost:3000/players/find', player, {headers: headers})
      .map(res => res.json());
  }
}
