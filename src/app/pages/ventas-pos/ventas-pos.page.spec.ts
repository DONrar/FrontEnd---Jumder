import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasPosPage } from './ventas-pos.page';

describe('VentasPosPage', () => {
  let component: VentasPosPage;
  let fixture: ComponentFixture<VentasPosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VentasPosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
