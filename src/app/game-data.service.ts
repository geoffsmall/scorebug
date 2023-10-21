import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Team{
  teamname:string,
  city: string,
  logo:string
};

interface Player{
  fname:string,
  lname:string,
  number:number
}

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
