import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client/client.component';
import { AdminComponent } from './admin/admin.component';
import { MatchupComponent } from './matchup/matchup.component';
import { LineupComponent } from './lineup/lineup.component';
import { ScoreComponent } from './score/score.component';
import { FinalComponent } from './final/final.component';
import { PlayerOfGameComponent } from './player-of-game/player-of-game.component';

const routes: Routes = [
  {path: '', redirectTo: 'client', pathMatch: 'full'},
  { path: 'client', component: ClientComponent },
  { path: 'matchup', component: MatchupComponent},
  { path: 'lineup', component: LineupComponent },
  { path: 'score', component: ScoreComponent },
  { path: 'final', component: FinalComponent },
  { path: 'potg', component: PlayerOfGameComponent },
  { path: 'admin', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
