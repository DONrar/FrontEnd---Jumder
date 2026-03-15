import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquiposListPage } from './equipos-list.page';

describe('EquiposListPage', () => {
  let component: EquiposListPage;
  let fixture: ComponentFixture<EquiposListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EquiposListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
