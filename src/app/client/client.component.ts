import { Component, ElementRef, OnInit } from '@angular/core';
import { filter, takeWhile, timer } from 'rxjs';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  title = 'Scorebug';
  public timeLeft:string = "";
  private originalTime:string = "";
  private pauseTimer:boolean = false;

  public homeTeam:string = "";
  public homeScore:number = 0;
  public homeShots:number = 0;
  public homeExtra:string = "";
  public guestTeam:string = "";
  public guestScore:number = 0;
  public guestShots:number = 0;
  public guestExtra:string = "";
  public guestColour:string="#FF0000";
  public homeColour:string="";
  public time:string = "";
  public period:string ="";

  public socketConnected:boolean = false;

  timeSub:any;
  
  public goalSlideIn = false;
  public goalSlideOut = false;
  public messageStr:string = "";


  constructor(private socketService: SocketService, private elementRef: ElementRef){
    this.originalTime = "20:15";

    //let totalSeconds = this.parseTimeString(this.originalTime);

    //this.startTimer(totalSeconds);

    this.socketService.clientGameStatsUpdate$.subscribe((gameStats:any)=>{
      console.log(gameStats);
        const {time, period, homeTeam, homeScore, homeShots, homeExtra, guestTeam, guestScore, guestShots, guestExtra, homeColour, guestColour} = gameStats;
        this.period = period;
        this.homeTeam = homeTeam,
        this.homeScore = homeScore;
        this.homeShots = homeShots;
        this.homeExtra = homeExtra;
        this.guestTeam = guestTeam;
        this.guestScore = guestScore;
        this.guestShots = guestShots;
        this.guestExtra = guestExtra;
        this.homeColour = homeColour;
        this.guestColour = guestColour;
        
        this.convertTimeToString(time);
    });

    this.socketService.clientScoreUpdate$.subscribe((scoreData:any)=>{
      const {guestScore, homeScore} = scoreData;

      if(guestScore != null){
        this.guestScore = guestScore;
      }else if(homeScore != null){
        this.homeScore = homeScore;
      }
    });

    this.socketService.clientShotsUpdate$.subscribe((shotsData:any)=>{
      const {guestShots, homeShots} = shotsData;

      console.log(guestShots, homeShots);
      
      if(guestShots != null){
        this.guestShots = guestShots;
      }else if(homeShots != null){
        this.homeShots = homeShots;
      }
    });

    this.socketService.startTimer$
    .pipe(
      filter(time=>!!time)
    )
    .subscribe((time:any)=>{
      console.log(time);
      this.pauseTimer = false;
      this.startTimer(time);
    });

    this.socketService.stopTimer$
    .pipe(
      filter(time=>!!time)
    )
    .subscribe((time:any)=>{
      console.log(time);
      this.pauseTimer = true;

      this.timeSub.unsubscribe();

      this.convertTimeToString(time);
    });



    this.socketService.displayMessage$
    .pipe(
      filter(msg=>!!msg)
    )
    .subscribe((msg:any)=>{
      this.messageStr = msg;
      setTimeout(()=>{
        this.goalSlideOut = false;
        this.goalSlideIn = true;
        setTimeout(()=>{
          this.goalSlideIn = false;
          this.goalSlideOut = true;
        },5000);
      },3000);
    });
    //const minutes: number = Math.floor(value / 60);
    //('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  private convertTimeToString(time:number){
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;

    let minutesStr = ('0' + minutes).slice(-2); // add extra 0 if needed
    let secondsStr = ('0' + seconds).slice(-2); // add extra 0 if needed
    
    this.timeLeft = `${minutesStr}:${secondsStr}`;
  }

  private parseTimeString(timeString:string){
    let timeStrings = timeString.split(":");

    let minutes = parseInt(timeStrings[0]);
    let seconds = parseInt(timeStrings[1]);

    let totalSeconds = (minutes * 60) + seconds;
  
    return totalSeconds
  }

  public ngOnInit(): void {
    console.log("OnInit");
    this.socketService.clientSocketStatus$.subscribe((status)=>{
      if(status === "connected"){
        this.socketConnected = true;
        this.socketService.sendMessage("clientJoin", "client");
      }      
    });

    this.elementRef.nativeElement.ownerDocument.body.style.setProperty("overflow-y", "hidden", "important");

    /*
    setInterval(()=>{
      this.pauseTimer = true;
    }, 5000);

    setInterval(()=>{
      this.pauseTimer = false;
    }, 10000);
    */
    /*
    const source = timer(1000, 2000);
    const abc = source.subscribe(val => {
      console.log(val, '-');
      this.subscribeTimer = this.timeLeft - val;
    });
    */
  }

  startTimer(totalSeconds:number){

    if(this.timeSub) this.timeSub.unsubscribe();

    this.timeSub = timer(0, 1000)
    .pipe(
      filter(()=>{
        return this.pauseTimer != true;
      }),
      takeWhile(value=>totalSeconds-value >= 0)
    )
    .subscribe((value) =>{
      let secondsLeft = totalSeconds - value;
      const minutesLeft = Math.floor(secondsLeft / 60);
      this.timeLeft = ('00' + minutesLeft).slice(-2) + ':' + ('00' + Math.floor(secondsLeft - minutesLeft * 60)).slice(-2);
    });
  }

  getColour(type:string){
    console.log(this.guestColour, this.homeColour);
    if(type == 'guest'){      
      return this.guestColour;
    }else{
      return this.homeColour;
    }
  }

}
