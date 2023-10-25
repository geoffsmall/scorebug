import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timeout } from 'rxjs';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class SocketService{
  private socket:any;

  public clientGameStatsUpdate$: BehaviorSubject<string> = new BehaviorSubject('');
  public clientScoreUpdate$: BehaviorSubject<string> = new BehaviorSubject('');
  public clientShotsUpdate$: BehaviorSubject<string> = new BehaviorSubject('');
  public clientSocketStatus$: BehaviorSubject<string> = new BehaviorSubject('disconnected');

  public adminGameStatsUpdate$: BehaviorSubject<string> = new BehaviorSubject('');

  public stopTimer$ = new BehaviorSubject<string|null>(null);
  public startTimer$ = new BehaviorSubject<string|null>(null);
  public displayMessage$ = new BehaviorSubject<string|null>(null);

  constructor() {
    this.clientGameStatsUpdate$.asObservable();
    this.clientScoreUpdate$.asObservable();
    this.clientShotsUpdate$.asObservable();
    this.clientSocketStatus$.asObservable();

    this.adminGameStatsUpdate$.asObservable();

    this.socket = io('http://localhost:3006');
    //this.socket = io('http://jdcarwash.com');

    this.socket.on("connect",()=>{
      console.log("Connected to Socket");
      // Display Scoreboard
      this.clientSocketStatus$.next("connected");
    });
    this.socket.on("reconnect",()=>{
      console.log("Reconnected to server");
      /*
      setTimeout(()=>{
        this.socket.emit("clientJoin", "client");
      },3000);
      */
      
      // Display Scoreboard
      this.clientSocketStatus$.next("connected");
    });
    this.socket.on("disconnect",()=>{
      console.log("Disconnected from server!");
      // Hide scoreboard
      this.clientSocketStatus$.next("disconnected");
    });

    this.socket.on('clientUpdate', (gameStats:any) =>{
      this.clientGameStatsUpdate$.next(gameStats);
    });

    this.socket.on('clientScoreUpdate', (scoreData:any) =>{
      this.clientScoreUpdate$.next(scoreData);
    });

    this.socket.on('clientShotsUpdate', (shotsData:any) =>{
      this.clientShotsUpdate$.next(shotsData);
    });

    this.socket.on('adminUpdate', (gameStats:any) =>{
      this.adminGameStatsUpdate$.next(gameStats);
    });

    this.socket.on('startTimer', (time:any) =>{
      this.startTimer$.next(time);
    });

    this.socket.on('stopTimer', (time:any) =>{
      this.stopTimer$.next(time);
    });

    this.socket.on('displayMessage', (msg:any) =>{
      this.displayMessage$.next(msg);
    });
  }
  
  public sendMessage(title:string, payload:any="") {
    console.log(title, payload);
    this.socket.emit(title, payload);
  }
}

