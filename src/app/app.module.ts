import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClientComponent } from './client/client.component';
import { AdminComponent } from './admin/admin.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { MatchupComponent } from './matchup/matchup.component';
import { LineupComponent } from './lineup/lineup.component';
import { ScoreComponent } from './score/score.component';
import { FinalComponent } from './final/final.component';
@NgModule({
  declarations: [
    AppComponent,
    ClientComponent,
    AdminComponent,
    MatchupComponent,
    LineupComponent,
    ScoreComponent,
    FinalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
