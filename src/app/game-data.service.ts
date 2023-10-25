import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from './shared/models/player.interface';
import { Team } from './shared/models/team.interface';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  private _fqdn = "http://localhost:3006";

  constructor(
    protected _http: HttpClient
  ) { }

  getPlayers(){
    return this._http.get<Player[]>(`${this._fqdn}/getPlayers`);
  }

  getTeams(){
    return this._http.get<Team[]>(`${this._fqdn}/getTeams`);
  }
}
