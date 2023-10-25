import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import { GameDataService } from '../game-data.service';
import { take } from 'rxjs';
import { Player } from '../shared/models/player.interface';
import { Team } from '../shared/models/team.interface';

@Component({
  selector: 'app-matchup',
  templateUrl: './matchup.component.html',
  styleUrls: ['./matchup.component.scss']
})
export class MatchupComponent implements OnInit {

  private players:Player[] = [];
  private teams:Team[] = [];
  private socketConnected:boolean = false;

  public selHomeTeam:Team = {teamname:'', city:''};
  public selGuestTeam:Team = {teamname:'', city:''};
  public gameTitle:string = '';

  constructor(
    private socketService: SocketService,
    private _gameDataService: GameDataService
  ) { }

  ngOnInit(): void {

    this.socketService.clientSocketStatus$.subscribe((status)=>{
      if(status === "connected"){
        this.socketConnected = true;
        this.socketService.sendMessage("clientJoin", "client");
      }      
    });

    this.socketService.clientGameStatsUpdate$.subscribe((gameStats: any) => {
      this._processGameStats(gameStats);
    });

    this._gameDataService.getTeams()
      .pipe(
        take(1),
      )
      .subscribe((teams: Team[]) => {
        this.teams = teams.sort((a:Team, b:Team):number => {
          if(!a.city || !b.city) return 0;

          return a.city.localeCompare(b.city)
        });

        this.teams.push({
          teamname: "Custom",
          city:""
        })
      });

    this._gameDataService.getPlayers()
      .pipe(
        take(1),
      )
      .subscribe((players: Player[]) => {
        this.players = players.sort((a, b) => a.number - b.number);;
      });

  }

  _processGameStats(gameStats:{[key:string]:any}){
    
    const {guestTeam, homeTeam, gameTitle} = gameStats;

    this.gameTitle = gameTitle;

    this.selHomeTeam = this.teams.find((team:Team)=>team.teamname === homeTeam) || {teamname:'', city:''};

    this.selGuestTeam = this.teams.find((team:Team)=>team.teamname === guestTeam) || {teamname:'', city:''};

    //console.log(selHomeTeam, selGuestTeam);

  }

}
