import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAddress } from './create-address';

describe('CreateAddress', () => {
  let component: CreateAddress;
  let fixture: ComponentFixture<CreateAddress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAddress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
