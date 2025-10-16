import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionDialog } from './edit-transaction-dialog';

describe('EditTransactionDialog', () => {
  let component: EditTransactionDialog;
  let fixture: ComponentFixture<EditTransactionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTransactionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTransactionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
