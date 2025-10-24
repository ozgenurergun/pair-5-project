import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateContactMedium } from './create-contact-medium';

describe('CreateContactMedium', () => {
  let component: CreateContactMedium;
  let fixture: ComponentFixture<CreateContactMedium>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContactMedium]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateContactMedium);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
