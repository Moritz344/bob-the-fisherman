import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      startBot: vi.fn().mockResolvedValue(undefined),
      getBotCommands: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep default settings when nothing is stored', async () => {
    (window as any).electronAPI.getBotSettings = vi.fn().mockResolvedValue(undefined);
    await component.initBotSettings();
    expect(component.currentSelected()).toEqual({
      username: 'fishermanbob69',
      host: 'localhost',
      version: '1.21.11',
      auth: 'offline',
      port: 0,
      started: false,
    });
  });

  it('should load stored settings when present', async () => {
    const stored = { host: 'myserver.com', port: 25565, username: 'bob', version: '1.20', auth: 'microsoft', started: false };
    (window as any).electronAPI.getBotSettings = vi.fn().mockResolvedValue(stored);
    await component.initBotSettings();
    expect(component.currentSelected()).toEqual(stored);
  });

  it('should start the bot with the current settings', async () => {
    await component.onStart();
    expect((window as any).electronAPI.startBot).toHaveBeenCalledWith(
      'localhost',
      0,
      '1.21.11',
      'offline',
      'fishermanbob69'
    );
  });
});
