import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Settings } from './settings';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      getBotCommands: vi.fn().mockResolvedValue([]),
      getMinecraftVersions: vi.fn().mockResolvedValue([]),
      saveBotSettings: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the form from the default service settings', () => {
    component.initCurrentSelected();
    expect(component.settingsModel()).toEqual({
      host: 'localhost',
      auth: 'offline',
      version: '1.21.11',
      username: 'fishermanbob69',
      port: 0,
      started: false,
    });
  });
});
