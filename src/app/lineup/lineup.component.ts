import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { filter, map, take, tap } from 'rxjs';
import { Player } from '../shared/models/player.interface';
import { Team } from '../shared/models/team.interface';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss']
})
export class LineupComponent implements OnInit {

  public players:Player[] = [];
  public forwards:Player[] = [];
  public defense:Player[] = [];
  public goalies:Player[] = [];

  public fline1player1:string = "";
  public fline1player2:string = "";
  public fline1player3:string = "";

  public fline2player1:string = "";
  public fline2player2:string = "";
  public fline2player3:string = "";

  public fline3player1:string = "";
  public fline3player2:string = "";
  public fline3player3:string = "";

  public dline1player1:string = "";
  public dline1player2:string = "";

  public dline2player1:string = "";
  public dline2player2:string = "";
  
  public dline3player1:string = "";
  public dline3player2:string = "";

  public team:Team = {
    city:'',
    teamname:''
  };

  constructor(
    private _gameDataService: GameDataService,
    private _socketService: SocketService
  ) { 
    
  }

  ngOnInit(): void {
    this._socketService.clientSocketStatus$.subscribe((status)=>{
      if(status === "connected"){
        this._socketService.sendMessage("clientJoin", "client");
      }      
    });

    this._socketService.clientGameStatsUpdate$.subscribe((gameStats:any)=>{
      console.log(gameStats);

      this._processGameStats(gameStats);

    });

    this._gameDataService.getTeams()
    .pipe(
      tap(teams=>console.log(teams)),
      map((teams)=>{
        return teams.find(team=>team.teamname==="Kinucks U13 D")
      }),
      take(1)
    )
    .subscribe((team:any)=>{
      console.log(team);
      this.team = team;
    });

    this._gameDataService.getPlayers()
      .pipe(
        take(1),
      )
      .subscribe((players: Player[]) => {
        this.players = players.sort((a, b) => a.number - b.number);;

        this._processPlayerData(players);
        console.log(this.players);
      });

  }

  _processPlayerData(players:Player[]){
    players.forEach((player:Player)=>{
      switch(player.position){
        case "Forward":
          this.forwards.push(player);
        break;
        case "Defense":
          this.defense.push(player);
        break;
        case "Goalie":
          this.goalies.push(player);
        break;
      }
    });
  }

  _processGameStats(gameStats:{[key:string]:any}){
    Object.assign(this,gameStats);
  }

}
