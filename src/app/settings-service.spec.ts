import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SettingsService } from './settings-service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      initLoot: vi.fn().mockResolvedValue([]),
      getMinecraftVersions: vi.fn().mockResolvedValue([]),
      saveBotSettings: vi.fn().mockResolvedValue(undefined),
      saveBotActionSettings: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      providers: [
        SettingsService,
        provideRouter([])
      ]
    }).compileComponents();

    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty log', () => {
    expect(service.logs()).toEqual([]);
  });

  it('should set started state', () => {
    expect(service.getStarted()).toBe(false);
    service.setStarted(true);
    expect(service.getStarted()).toBe(true);
  });

  it('should save settings', async () => {
    const data = { host: 'localhost', port: 25565, username: 'bob', version: '1.21', auth: 'offline', started: false };
    await service.saveSettings(data);
    expect((window as any).electronAPI.saveBotSettings).toHaveBeenCalledWith(data);
    expect(service.getSettings()).toEqual(data);
  });

  it('should merge duplicate loot items on init', async () => {
    const items = [
      { name: 'cod', displayName: 'Cod', count: 1, img: null },
      { name: 'cod', displayName: 'Cod', count: 2, img: null },
      { name: 'pufferfish', displayName: 'Pufferfish', count: 1, img: null },
    ];
    (window as any).electronAPI.initLoot = vi.fn().mockResolvedValue(items);

    await service.initLootItems();

    expect(service.loot().length).toBe(2);
    const cod = service.loot().find(item => item.name === 'cod');
    expect(cod?.count).toBe(3);
  });

  it('should update loot log by incrementing count of existing item', async () => {
    (window as any).electronAPI.initLoot = vi.fn().mockResolvedValue([
      { name: 'cod', displayName: 'Cod', count: 2, img: null },
    ]);
    await service.initLootItems();

    service.updateLootLog({ name: 'cod', displayName: 'Cod', count: 3, msg: 'Caught Cod (3)', level: 'loot', timestamp: '' });

    const cod = service.loot().find(item => item.name === 'cod');
    expect(cod?.count).toBe(3);
  });
});
