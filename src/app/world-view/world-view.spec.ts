import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldView } from './world-view';

describe('WorldView', () => {
  let component: WorldView;
  let fixture: ComponentFixture<WorldView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
