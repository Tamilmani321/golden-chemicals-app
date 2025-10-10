import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionDialogue } from './add-transaction-dialogue';

describe('AddTransactionDialogue', () => {
  let component: AddTransactionDialogue;
  let fixture: ComponentFixture<AddTransactionDialogue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransactionDialogue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTransactionDialogue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
