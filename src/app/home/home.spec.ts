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
});
