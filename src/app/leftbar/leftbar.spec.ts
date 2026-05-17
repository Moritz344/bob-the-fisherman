import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Leftbar } from './leftbar';

describe('Leftbar', () => {
  let component: Leftbar;
  let fixture: ComponentFixture<Leftbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Leftbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Leftbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
