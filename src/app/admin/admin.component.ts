import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, Observable, Subscription, takeWhile, timer } from 'rxjs';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  adminForm = this.fb.group({
    period: ['1', Validators.compose([Validators.required, Validators.pattern("[0-9]{1}")])],
    time: ['00:00', Validators.compose([Validators.required,Validators.pattern("[0-9]{2}:[0-9]{2}")])], 
    homeTeam: ['HME', Validators.compose([Validators.required, Validators.pattern("[A-Z0-9]{1,7}")])], //
    homeScore: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    homeShots: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    homeExtra: [''],
    guestTeam: ['GST', Validators.compose([Validators.required,Validators.pattern("[A-Z0-9]{1,7}")])], //, Validators.pattern("[^\'\"\.]")
    guestScore: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    guestShots: ['0', Validators.compose([Validators.required,Validators.pattern("[0-9]{0,3}")])], 
    guestExtra: [''],
    guestColour: ['', Validators.required],
    homeColour: ['', Validators.required],
    message:[''],
    goalScorer:[''],
    presetMessage:['']
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

  players:string[] = [
    "#2 Owen Coutts",
    "#4 Lawson Cohoon",
    "#5 Andrew Page",
    "#6 Charlie Small",
    "#7 Max Malhotra",
    "#8 Nolan Knight",
    "#9 Hayden Caravaggio",
    "#10 Harrison Bray",
    "#11 Borden Hubbard",
    "#12 Charlie Storey",
    "#14 Owen McKinlay",
    "#15 Alex Mercer",
    "#16 Mason Caravaggio",
    "#17 Coby MacArthur",
    "#18 Blake McCrae"
  ];

  timerSub:any;

  pauseTimer:boolean = true;

  constructor(private fb: FormBuilder, private socketService: SocketService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.socketService.clientSocketStatus$.subscribe((status)=>{
      
      if(status==="connected"){
        console.log(status, status==="connected");
        this.socketService.sendMessage("adminJoin", "admin");
      }
    });

    this.socketService.adminGameStatsUpdate$.subscribe((gameData:any)=>{

      console.log(gameData);

      const {period='1', time='0', homeTeam="T1", homeScore=0, homeShots=0, homeExtra="", guestTeam="T2", guestScore=0, guestShots=0, guestExtra="", homeColour, guestColour} = gameData;
      
      this.adminForm.patchValue({
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

    const updatedGameData = {
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
      guestColour: formControls.guestColour.value,
      homeColour: formControls.homeColour.value
    };

    this.socketService.sendMessage("adminUpdate", updatedGameData);
    
  }

}
