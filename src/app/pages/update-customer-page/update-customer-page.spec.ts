import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCustomerPage } from './update-customer-page';

describe('UpdateCustomerPage', () => {
  let component: UpdateCustomerPage;
  let fixture: ComponentFixture<UpdateCustomerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCustomerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
