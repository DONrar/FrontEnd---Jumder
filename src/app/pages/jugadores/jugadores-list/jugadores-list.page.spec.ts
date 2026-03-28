import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JugadoresListPage } from './jugadores-list.page';

describe('JugadoresListPage', () => {
  let component: JugadoresListPage;
  let fixture: ComponentFixture<JugadoresListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JugadoresListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
