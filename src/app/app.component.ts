import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public ngOnInit(): void {

  }

  // title = 'Scorebug';
  // public timeLeft:string = "";
  // private originalTime:string = "";
  // private pauseTimer:boolean = false;

  // public homeTeam:string = "";
  // public homeScore:number = 0;
  // public homeShots:number = 0;
  // public homeExtra:string = "";
  // public guestTeam:string = "";
  // public guestScore:number = 0;
  // public guestShots:number = 0;
  // public guestExtra:string = "";

  // public socketConnected:boolean = false;


  // constructor(private socketService: SocketService){
  //   socketService.sendMessage("howdy");

  //   this.originalTime = "20:15";

  //   let totalSeconds = this.parseTimeString(this.originalTime);

  //   this.startTimer(totalSeconds);

  //   this.socketService.clientGameStatsUpdate$.subscribe((gameStats:any)=>{
  //       const {homeTeam, homeScore, homeShots, homeExtra, guestTeam, guestScore, guestShots, guestExtra} = gameStats;
  //       this.homeTeam = homeTeam,
  //       this.homeScore = homeScore;
  //       this.homeShots = homeShots;
  //       this.homeExtra = homeExtra;
  //       this.guestTeam = guestTeam;
  //       this.guestScore = guestScore;
  //       this.guestShots = guestShots;
  //       this.guestExtra = guestExtra;
  //   });

  //   this.socketService.clientSocketStatus$.subscribe((status:any)=>{
  //     this.socketConnected = false;
  //     if(status === "connected"){
  //       this.socketConnected = true;
  //     }
      
  //   });
    
  //   //const minutes: number = Math.floor(value / 60);
  //   //('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  // }

  // private parseTimeString(timeString:string){
  //   let timeStrings = timeString.split(":");

  //   let minutes = parseInt(timeStrings[0]);
  //   let seconds = parseInt(timeStrings[1]);

  //   let totalSeconds = (minutes * 60) + seconds;

  //   return totalSeconds
  // }

  // public ngOnInit(): void {
  //   console.log("OnInit");
    

  //   setInterval(()=>{
  //     this.pauseTimer = true;
  //   }, 5000);

  //   setInterval(()=>{
  //     this.pauseTimer = false;
  //   }, 10000);
  //   /*
  //   const source = timer(1000, 2000);
  //   const abc = source.subscribe(val => {
  //     console.log(val, '-');
  //     this.subscribeTimer = this.timeLeft - val;
  //   });
  //   */
  // }

  // startTimer(totalSeconds:number){
  //   timer(0, 1000)
  //   .pipe(
  //     filter(()=>{
  //       return this.pauseTimer != true;
  //     })
  //   )
  //   .subscribe((value) =>{
  //     let secondsLeft = totalSeconds - value;
  //     const minutesLeft = Math.floor(secondsLeft / 60);
  //     this.timeLeft = ('00' + minutesLeft).slice(-2) + ':' + ('00' + Math.floor(secondsLeft - minutesLeft * 60)).slice(-2);
  //   });
  // }

}
