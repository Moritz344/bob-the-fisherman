import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Log } from './log';

describe('Log', () => {
  let component: Log;
  let fixture: ComponentFixture<Log>;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      getBotCommands: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [Log]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Log);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
