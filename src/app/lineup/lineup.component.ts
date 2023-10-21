import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { take } from 'rxjs';
import { Player } from '../shared/models/player.interface';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss']
})
export class LineupComponent implements OnInit {

  public players:Player[] = [];

  constructor(
    private _gameDataService: GameDataService
  ) { }

  ngOnInit(): void {

    this._gameDataService.getPlayers()
      .pipe(
        take(1),
      )
      .subscribe((players: Player[]) => {
        this.players = players.sort((a, b) => a.number - b.number);;

        console.log(this.players);
      });

  }

}
