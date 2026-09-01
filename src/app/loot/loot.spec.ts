import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Loot } from './loot';

describe('Loot', () => {
  let component: Loot;
  let fixture: ComponentFixture<Loot>;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      getBotCommands: vi.fn().mockResolvedValue([]),
      initLoot: vi.fn().mockResolvedValue([]),
      dropLoot: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [Loot],
      providers: [provideRouter([])]
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
