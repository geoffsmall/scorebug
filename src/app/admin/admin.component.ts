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
    time: ['00:00', Validators.compose([Validators.required,Validators.pattern("[0-9]{2}:[0-9]{2}")])], 
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
  public homeCustom:boolean = false;

  constructor(
    private fb: FormBuilder, 
    private socketService: SocketService, 
    private _snackBar: MatSnackBar,
    private _gameDataService: GameDataService
  ) { }

  ngOnInit(): void {
    this.socketService.clientSocketStatus$.subscribe((status)=>{
      
      if(status==="connected"){
        console.log(status, status==="connected");
        this.socketService.sendMessage("adminJoin", "admin");
      }
    });

    this.socketService.adminGameStatsUpdate$.subscribe((gameData:any)=>{

      const {gameTitle='', period='1', time='0', homeTeam="T1", homeScore=0, homeShots=0, homeExtra="", guestTeam="T2", guestScore=0, guestShots=0, guestExtra="", homeColour, guestColour} = gameData;
      
      console.log(homeTeam, guestTeam)

      this.adminForm.patchValue({
        gameTitle,
        period: this.parsePeriod(period),
        time: this.convertTimeToString(time),
        homeTeam,
        homeScore,
        homeShots,
        homeExtra,
        homeColour,
        guestTeam,
        guestScore,
        guestShots,
        guestExtra,
        guestColour
      });
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

  private convertTimeToString(time:number){
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;

    let minutesStr = ('0' + minutes).slice(-2); // add extra 0 if needed

    let secondsStr = ('0' + seconds).slice(-2); // add extra 0 if needed

    return `${minutesStr}:${secondsStr}`;
  }

  private parseTimeString(timeString:string="00:00"){
    let timeStrings = timeString.split(":");

    let minutes = parseInt(timeStrings[0]);
    let seconds = parseInt(timeStrings[1]);

    let totalSeconds = (minutes * 60) + seconds;

    return totalSeconds
  }

  stopTimer(){
    const formControls = this.adminForm.controls;
    let timeStr:string = formControls.time.value || "00:00";
    let totalSeconds = this.parseTimeString(timeStr);
    
    this.pauseTimer = true;
    this.timerSub.unsubscribe();

    this.socketService.sendMessage("stopTimer", totalSeconds);
    //convertToSeconds()
  }

  startTimer(){
    if(this.timerSub){
      this.timerSub.unsubscribe();
    }

    const formControls = this.adminForm.controls;
    let timeStr:string = formControls.time.value || "00:00";

    if(timeStr.startsWith("-")){
      timeStr = "00:00";
      this.adminForm.patchValue({time:timeStr});

      this._snackBar.open("Time is 00:00, please reset time.");
      return;
    }

    let totalSeconds = this.parseTimeString(timeStr);

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
      let timeLeft = ('00' + minutesLeft).slice(-2) + ':' + ('00' + Math.floor(secondsLeft - minutesLeft * 60)).slice(-2);

      this.adminForm.patchValue({time:timeLeft})
    });
  }
  
  sendMessage(type:string){

    const formControls = this.adminForm.controls;

    let msg;

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

    let timeStr:string = `${formControls.time.value}`;

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
      homeColour:null
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
}
