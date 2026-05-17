import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loot } from './loot';

describe('Loot', () => {
  let component: Loot;
  let fixture: ComponentFixture<Loot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
