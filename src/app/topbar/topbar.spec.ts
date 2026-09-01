import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Topbar } from './topbar';

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      minimize: vi.fn().mockResolvedValue(undefined),
      exit: vi.fn().mockResolvedValue(undefined),
      openExternal: vi.fn().mockResolvedValue(undefined),
      getAboutData: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu', () => {
    expect(component.menuSelected()).toBe(false);
    component.onMenu();
    expect(component.menuSelected()).toBe(true);
    component.onMenu();
    expect(component.menuSelected()).toBe(false);
  });

  it('should minimize the window', async () => {
    await component.onMinimize();
    expect((window as any).electronAPI.minimize).toHaveBeenCalled();
  });
});
