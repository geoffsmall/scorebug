import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, Observable, Subscription, take, takeWhile, timer } from 'rxjs';
import { SocketService } from '../socket.service';
import { GameDataService } from '../game-data.service';
import { MatSelectChange } from '@angular/material/select';
import {Player} from '../shared/models/player.interface';
import {Team} from '../shared/models/team.interface';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  adminForm = this.fb.group({
    gameTitle:[''],
    period: ['1', Validators.compose([Validators.required, Validators.pattern("[0-9]{1}")])],
    timeMin: ['00', Validators.compose([Validators.required,Validators.pattern("[0-9]{1,2}")])], 
    timeSec: ['00', Validators.compose([Validators.required,Validators.pattern("[0-9]{1,2}")])], 
    homeTeam: ['HME', Validators.compose([Validators.required])], //
    homeTeamCustom:[''],
    homeScore: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    homeShots: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    homeExtra: [''],
    guestTeam: ['GST', Validators.compose([Validators.required])], //, Validators.pattern("[^\'\"\.]") // Validators.pattern("[A-Z0-9]{1,7}")
    guestTeamCustom:[''],
    guestScore: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    guestShots: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    guestExtra: [''],
    guestColour: [''],
    homeColour: [''],
    message:[''],
    goalScorer:[''],
    presetMessage:[''],
    guestTeamCityCustom:[''],
    guestTeamNameCustom:[''],
    guestTeamAbvCustom:[''],
    homeTeamCityCustom:[''],
    homeTeamNameCustom:[''],
    homeTeamAbvCustom:[''],
    // Lineup
    fline1player1:[''],
    fline1player2:[''],
    fline1player3:[''],
    fline2player1:[''],
    fline2player2:[''],
    fline2player3:[''],
    fline3player1:[''],
    fline3player2:[''],
    fline3player3:[''],
    dline1player1:[''],
    dline1player2:[''],
    dline2player1:[''],
    dline2player2:[''],
    dline3player1:[''],
    dline3player2:[''],
    // Player of the Game
    potgGameInfo:[''],
    potgPlayer:[''],
  });

  colours = [
    {hex: "#808080", name: "Grey"},
    {hex: "#F68428", name: "Orange"},
    {hex: "#800000", name: "Maroon"},
    {hex: "#FF0000", name: "Red"},
    {hex: "#800080", name: "Purple"},
    {hex: "#008000", name: "Green"},
    {hex: "#000080", name: "Dark Blue"},
    {hex: "#0000FF", name: "Blue"},
    {hex: "#008080", name: "Teal"},
  ];

  players:any;
  teams:any;

  timerSub:any;

  pauseTimer:boolean = true;

  public guestCustom:boolean = false;
  public guestTeamSel:string = "";

  public homeCustom:boolean = false;
  public homeTeamSel:string = "";

  constructor(
    private fb: FormBuilder, 
    private socketService: SocketService, 
    private _snackBar: MatSnackBar,
    private _gameDataService: GameDataService
  ) { }

  ngOnInit(): void {
    this.socketService.clientSocketStatus$.subscribe((status)=>{
      
      if(status==="connected"){
        this.socketService.sendMessage("adminJoin", "admin");
      }
    });

    this.socketService.adminGameStatsUpdate$.subscribe((gameData:any)=>{

      console.log(gameData);

      const {gameTitle='', period='1', time='0', homeTeam="T1", homeScore=0, homeShots=0, homeExtra="", guestTeam="T2", guestScore=0, guestShots=0, guestExtra="", homeColour, guestColour,guestTeamCityCustom, guestTeamNameCustom, guestTeamAbvCustom, homeTeamCityCustom, homeTeamNameCustom, homeTeamAbvCustom,// Lineup
      fline1player1,
      fline1player2,
      fline1player3,
      fline2player1,
      fline2player2,
      fline2player3,
      fline3player1,
      fline3player2,
      fline3player3,
      dline1player1,
      dline1player2,
      dline2player1,
      dline2player2,
      dline3player1,
      dline3player2,
      // Player of the Game
      potgGameInfo,
      potgPlayer} = gameData;
      
      this.adminForm.patchValue({
        gameTitle,
        period: this.parsePeriod(period),
        timeMin: this.convertTimeToString(time,"min"),
        timeSec: this.convertTimeToString(time,"sec"),
        homeTeam,
        homeScore,
        homeShots,
        homeExtra,
        homeColour,
        guestTeam,
        guestScore,
        guestShots,
        guestExtra,
        guestColour,
        guestTeamCityCustom,
        guestTeamNameCustom,
        guestTeamAbvCustom,
        homeTeamCityCustom,
        homeTeamNameCustom,
        homeTeamAbvCustom,
        // Lineup
        fline1player1,
        fline1player2,
        fline1player3,
        fline2player1,
        fline2player2,
        fline2player3,
        fline3player1,
        fline3player2,
        fline3player3,
        dline1player1,
        dline1player2,
        dline2player1,
        dline2player2,
        dline3player1,
        dline3player2,
        // Player of the Game
        potgGameInfo,
        potgPlayer,
      });

      this._processTeamNameSelections();
    });

    this._gameDataService.getTeams()
      .pipe(
        take(1),
      )
      .subscribe((teams) => {
        this.teams = teams.sort((a,b)=>a.city.localeCompare(b.city));

        this.teams.push({
          teamname:"Custom",
        })
      });

      this._gameDataService.getPlayers()
      .pipe(
        take(1),
      )
      .subscribe((players:Player[]) => {
        this.players = players.sort((a, b) => a.number - b.number);;
      });

      this.adminForm.markAllAsTouched();
  }

  parsePeriod(period:string){
    let periodStr = period.charAt(0);

    if(/[0-9]/.test(periodStr)){
      return `${periodStr}`;
    }else{
      return '1';
    }
  }

  private convertTimeToString(time:number, timeType:string){
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;

    let minutesStr = ('0' + minutes).slice(-2); // add extra 0 if needed

    let secondsStr = ('0' + seconds).slice(-2); // add extra 0 if needed

    if(timeType == "min"){
      return `${minutesStr}`;
    }else{
      return `${secondsStr}`;
    }
  }

  private parseTimeString(timeMin:string="00", timeSec:string="00"){
    let minutes = parseInt(timeMin);
    let seconds = parseInt(timeSec);

    console.log(timeSec, minutes, seconds, (minutes * 60) + seconds);

    let totalSeconds = (minutes * 60) + seconds;

    return totalSeconds
  }

  stopTimer(){
    const formControls = this.adminForm.controls;
    
    let timeMin = formControls.timeMin.value || "00";
    let timeSec = formControls.timeSec.value || "00";
    let totalSeconds = this.parseTimeString(timeMin, timeSec);
    
    this.pauseTimer = true;
    this.timerSub.unsubscribe();

    console.log(totalSeconds);

    this.socketService.sendMessage("stopTimer", totalSeconds);
    //convertToSeconds()
  }

  startTimer(){
    if(this.timerSub){
      this.timerSub.unsubscribe();
    }

    const formControls = this.adminForm.controls;
    let timeStr:string = `${formControls.timeMin.value}:${formControls.timeSec.value}` || "00:00";

    if(timeStr.startsWith("-")){
      this.adminForm.patchValue({timeMin:"00"});
      this.adminForm.patchValue({timeSec:"00"});

      this._snackBar.open("Time is 00:00, please reset time.");
      return;
    }

    let timeMin = formControls.timeMin.value || "00";
    let timeSec = formControls.timeSec.value || "00";

    let totalSeconds = this.parseTimeString(timeMin, timeSec);

    this.pauseTimer = false;
    this.updateTimerInput(totalSeconds);

    this.socketService.sendMessage("startTimer", totalSeconds);
  }

  updateTimerInput(totalSeconds:number){
    this.timerSub = timer(0, 1000)
    .pipe(
      filter(()=>{
        return this.pauseTimer != true;
      }),
      takeWhile(value=>totalSeconds-value >= 0)
    )
    .subscribe((value) =>{
      let secondsLeft = totalSeconds - value;
      const minutesLeft = Math.floor(secondsLeft / 60);
      let timeMinLeft = ('00' + minutesLeft).slice(-2);
      let timeSecLeft = ('00' + Math.floor(secondsLeft - minutesLeft * 60)).slice(-2);

      this.adminForm.patchValue({timeMin:timeMinLeft, timeSec:timeSecLeft});
    });
  }
  
  sendMessage(type:string){

    const formControls = this.adminForm.controls;

    let msg;

    console.log(type);

    if(type === "preset"){
      msg = formControls.presetMessage.value;
    }else if(type === "custom"){
      msg = formControls.message.value;
    }else{
      return;
    }
    

    this.socketService.sendMessage("displayMessage", msg);
  }

  displayGoalScorer(){
    const formControls = this.adminForm.controls;
    let selectedPlayer = formControls.goalScorer.value;
    this.socketService.sendMessage("displayMessage", `Goal! ${selectedPlayer}`);
  }

  updateScore(type:string, team:string){
    const formControls:any = this.adminForm.controls;
    let field:string = `${team}Score`;
    let scoreField:FormControl<any> = formControls[field];
    let scoreValue:number = scoreField.value;
    
    let updatedScore;
    if(type == "remove"){
      if(scoreValue > 0){
        updatedScore = scoreValue-1;
      }else{
        updatedScore = 0;
      }
    }else if(type =="add"){
      updatedScore = scoreValue+1;
    }

    if(updatedScore === scoreValue) return;
      
    scoreField.setValue(updatedScore);

    this.socketService.sendMessage("adminScoreUpdate", {[field]:updatedScore});
  }

  updateShots(type:string, team:string){
    const formControls:any = this.adminForm.controls;
    let field:string = `${team}Shots`;
    let shotsField:FormControl<any> = formControls[field];
    let shotsValue = shotsField.value;
    
    let updatedShots;
    if(type == "remove"){
      if(shotsValue > 0){
        updatedShots = shotsValue-1;
      }else{
        updatedShots = 0;
      }
    }else if(type =="add"){
      updatedShots = shotsValue+1;
    }

    if(updatedShots === shotsValue) return;

    shotsField.setValue(updatedShots);

    this.socketService.sendMessage("adminShotsUpdate", {[field]:updatedShots});
  }

  updatePeriod(type:string){
    console.log(type);
  }

  onSubmit():void{

    if(this.adminForm.status === "INVALID"){
      this._snackBar.open("Game Data Invalid, can't send.");
      return;
    }

    const formControls = this.adminForm.controls;

    let periodStr = "1st";
    switch(formControls.period?.value){
      case "2":
        periodStr = "2nd";
      break;
      case "3":
        periodStr = "3rd";
      break;
    }

    let timeStr:string = `${formControls.timeMin.value}:${formControls.timeSec.value}`;

    const updatedGameData:GameData = {
      gameTitle: formControls.gameTitle.value || '',
      period: periodStr,
      time: this.parseTimeString(timeStr),
      homeTeam: formControls.homeTeam.value,
      homeScore: formControls.homeScore.value,
      homeShots: formControls.homeShots.value,
      homeExtra: formControls.homeExtra.value,
      guestTeam: formControls.guestTeam.value,
      guestScore: formControls.guestScore.value,
      guestShots: formControls.guestShots.value,
      guestExtra: formControls.guestExtra.value,
      guestTeamCityCustom:null,
      guestTeamNameCustom:null,
      guestTeamAbvCustom:null,
      guestColour:null,
      homeTeamCityCustom:null,
      homeTeamNameCustom:null,
      homeTeamAbvCustom:null,
      homeColour:null,
      fline1player1:formControls.fline1player1.value,
      fline1player2:formControls.fline1player2.value,
      fline1player3:formControls.fline1player3.value,
      fline2player1:formControls.fline2player1.value,
      fline2player2:formControls.fline2player2.value,
      fline2player3:formControls.fline2player3.value,
      fline3player1:formControls.fline3player1.value,
      fline3player2:formControls.fline3player2.value,
      fline3player3:formControls.fline3player3.value,
      dline1player1:formControls.dline1player1.value,
      dline1player2:formControls.dline1player2.value,
      dline2player1:formControls.dline2player1.value,
      dline2player2:formControls.dline2player2.value,
      dline3player1:formControls.dline3player1.value,
      dline3player2:formControls.dline3player2.value,
      // Player of the Game
      potgGameInfo:formControls.potgGameInfo.value,
      potgPlayer:formControls.potgPlayer.value
    };

    if(this.guestCustom){
      updatedGameData.guestTeamCityCustom = formControls.guestTeamCityCustom.value;
      updatedGameData.guestTeamNameCustom = formControls.guestTeamNameCustom.value;
      updatedGameData.guestTeamAbvCustom = formControls.guestTeamAbvCustom.value;
      updatedGameData.guestColour = formControls.guestColour.value;
    }else{
      updatedGameData.guestColour = this._processTeamColor(formControls.guestTeam.value);
    }

    if(this.homeCustom){
      updatedGameData.homeTeamCityCustom = formControls.homeTeamCityCustom.value;
      updatedGameData.homeTeamNameCustom = formControls.homeTeamNameCustom.value;
      updatedGameData.homeTeamAbvCustom = formControls.homeTeamAbvCustom.value;
      updatedGameData.homeColour = formControls.homeColour.value;
    }else{
      updatedGameData.homeColour = this._processTeamColor(formControls.homeTeam.value);
    }

    this.socketService.sendMessage("adminUpdate", updatedGameData);
    
  }

  _processTeamColor(teamName:string|null){
    let selTeam = this.teams.find((team:{[key:string]:any})=>team['teamname'] === teamName);
    console.log(selTeam, teamName);
    if(selTeam){
      return selTeam.color;
    }else{
      return "#F0F0F0";
    }
  };

  toggleCustomTeam(type:string, event:MatSelectChange){
    if(type==="guest"){
      this.guestCustom = event.value==="Custom";      
    }else if(type==="home"){
      this.homeCustom = event.value==="Custom";
    }

    this._processTeamNameSelections();
  }

  _processTeamNameSelections(){
    const formControls = this.adminForm.controls;

    let homeTeam:string = formControls.homeTeam.value || "N/A";
    let guestTeam:string = formControls.guestTeam.value || "N/A";

    if(homeTeam === "Custom"){
      homeTeam = formControls.homeTeamNameCustom.value || "N/A";
    }

    if(guestTeam === "Custom"){
      guestTeam = formControls.guestTeamNameCustom.value || "N/A";
    }

    this.homeTeamSel = homeTeam;
    this.guestTeamSel = guestTeam;
  }

}

interface GameData {
  gameTitle:string,
  period:string,
  time:number,
  homeTeam:string|null,
  homeScore:string|null,
  homeShots:string|null,
  homeExtra:string|null,
  guestTeam:string|null,
  guestScore:string|null,
  guestShots:string|null,
  guestExtra:string|null,
  guestColour?:string|null,
  homeColour?:string|null,
  guestTeamCityCustom?:string|null,
  guestTeamNameCustom?:string|null,
  guestTeamAbvCustom?:string|null,
  homeTeamCityCustom?:string|null,
  homeTeamNameCustom?:string|null,
  homeTeamAbvCustom?:string|null,
  fline1player1:string|null,
  fline1player2:string|null,
  fline1player3:string|null,
  fline2player1:string|null,
  fline2player2:string|null,
  fline2player3:string|null,
  fline3player1:string|null,
  fline3player2:string|null,
  fline3player3:string|null,
  dline1player1:string|null,
  dline1player2:string|null,
  dline2player1:string|null,
  dline2player2:string|null,
  dline3player1:string|null,
  dline3player2:string|null,
  // Player of the Game
  potgGameInfo:string|null,
  potgPlayer:string|null,
}
