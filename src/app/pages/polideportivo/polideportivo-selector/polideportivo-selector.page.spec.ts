import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolideportivoSelectorPage } from './polideportivo-selector.page';

describe('PolideportivoSelectorPage', () => {
  let component: PolideportivoSelectorPage;
  let fixture: ComponentFixture<PolideportivoSelectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PolideportivoSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
