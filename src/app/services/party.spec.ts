import { TestBed } from '@angular/core/testing';

import { PartyService } from './partyService';

describe('Party', () => {
  let service: PartyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
