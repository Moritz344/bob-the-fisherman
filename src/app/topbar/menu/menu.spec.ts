import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;

  beforeEach(async () => {
    (window as any).electronAPI = {
      log: vi.fn(),
      botSkinData: vi.fn(),
      stopBot: vi.fn().mockResolvedValue(undefined),
      getBotSettings: vi.fn().mockResolvedValue(undefined),
      getActionSettings: vi.fn().mockResolvedValue(undefined),
      exit: vi.fn().mockResolvedValue(undefined),
      openAbout: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [Menu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
