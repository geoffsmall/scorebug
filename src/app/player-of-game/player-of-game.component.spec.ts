import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerOfGameComponent } from './player-of-game.component';

describe('PlayerOfGameComponent', () => {
  let component: PlayerOfGameComponent;
  let fixture: ComponentFixture<PlayerOfGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerOfGameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerOfGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
