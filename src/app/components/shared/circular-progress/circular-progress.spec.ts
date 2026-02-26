import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularProgress } from './circular-progress';

describe('CircularProgress', () => {
  let component: CircularProgress;
  let fixture: ComponentFixture<CircularProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularProgress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
