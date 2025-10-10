import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPartyDialog } from './add-party-dialog';

describe('AddPartyDialog', () => {
  let component: AddPartyDialog;
  let fixture: ComponentFixture<AddPartyDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPartyDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPartyDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
