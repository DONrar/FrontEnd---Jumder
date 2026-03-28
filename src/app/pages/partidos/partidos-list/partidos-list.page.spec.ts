import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartidosListPage } from './partidos-list.page';

describe('PartidosListPage', () => {
  let component: PartidosListPage;
  let fixture: ComponentFixture<PartidosListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartidosListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
