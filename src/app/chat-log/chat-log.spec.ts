import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLog } from './chat-log';

describe('ChatLog', () => {
  let component: ChatLog;
  let fixture: ComponentFixture<ChatLog>;

  beforeEach(async () => {
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
});
