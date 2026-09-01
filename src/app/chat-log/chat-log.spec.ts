import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLog } from './chat-log';

describe('ChatLog', () => {
  let component: ChatLog;
  let fixture: ComponentFixture<ChatLog>;

  const mockCommands = [
    { name: '!start', desc: 'start fishing', args: ['start'], onlyCli: false },
    { name: '!drop', desc: 'drop an item', args: ['drop', 'itemName'], onlyCli: false },
    { name: '!show inventory', desc: 'list items', args: ['show inventory'], onlyCli: true },
  ];

  beforeEach(async () => {
    (window as any).electronAPI = {
      getBotCommands: vi.fn().mockResolvedValue(mockCommands),
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      startFishing: vi.fn().mockResolvedValue(undefined),
      stopCurrentTask: vi.fn().mockResolvedValue(undefined),
      followPlayer: vi.fn().mockResolvedValue(undefined),
      depositLoot: vi.fn().mockResolvedValue(undefined),
      dropLoot: vi.fn().mockResolvedValue(undefined),
      sendMinecraftChatMessage: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [ChatLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load non-cli commands', async () => {
    await component.initBotCommands();
    expect(component.commandsToUse().length).toBe(2);
    expect(component.commandsToUse().every(cmd => !cmd.onlyCli)).toBe(true);
  });

  it('should filter commands matching the input', () => {
    component.started.set(true);
    component.commandInput.set('!dr');
    component.onFindCommand({ key: 'a' });
    expect(component.foundCommands().map(cmd => cmd.name)).toEqual(['!drop']);
  });

  it('should clear found commands when input is empty', () => {
    component.commandsToUse.set(mockCommands);
    component.commandInput.set('');
    component.onFindCommand({ key: 'a' });
    expect(component.foundCommands()).toEqual([]);
  });

  it('should not act on commands when bot is not started', () => {
    component.started.set(false);
    component.commandInput.set('!start');
    component.onCommand();
    expect((window as any).electronAPI.startFishing).not.toHaveBeenCalled();
  });

  it('should start fishing on !start', async () => {
    component.started.set(true);
    component.commandInput.set('!start');
    await component.onCommand();
    expect((window as any).electronAPI.startFishing).toHaveBeenCalled();
    expect(component.currentBotTask()).toBe('Fishing');
  });

  it('should clear input after sending a command', async () => {
    component.started.set(true);
    component.commandInput.set('hello world');
    await component.onCommand();
    expect(component.lastInput()).toBe('hello world');
    expect(component.commandInput()).toBe('');
    expect((window as any).electronAPI.sendMinecraftChatMessage).toHaveBeenCalledWith('hello world');
  });

  it('should clear the logs', () => {
    component.data.set([{ msg: 'a', level: 'info', timestamp: '00:00:00' }]);
    component.clear();
    expect(component.data()).toEqual([]);
  });
});
