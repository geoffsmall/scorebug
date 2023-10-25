import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-player-of-game',
  templateUrl: './player-of-game.component.html',
  styleUrls: ['./player-of-game.component.scss']
})
export class PlayerOfGameComponent implements OnInit {

  public potgGameInfo:string = "";
  public potgPlayer:string = "";

  constructor(private _socketService: SocketService) { }

  ngOnInit(): void {
    this._socketService.clientSocketStatus$.subscribe((status)=>{
      if(status === "connected"){
        this._socketService.sendMessage("clientJoin", "client");
      }      
    });

    this._socketService.clientGameStatsUpdate$.subscribe((gameStats:any)=>{
      this._processGameStats(gameStats);
    });
  }

  _processGameStats(gameStats:{[key:string]:any}){
    const {potgGameInfo,potgPlayer} = gameStats;

    this.potgGameInfo = potgGameInfo;
    this.potgPlayer = potgPlayer;
  }

}
