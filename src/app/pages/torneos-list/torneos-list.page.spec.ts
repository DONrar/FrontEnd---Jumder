import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TorneosListPage } from './torneos-list.page';

describe('TorneosListPage', () => {
  let component: TorneosListPage;
  let fixture: ComponentFixture<TorneosListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TorneosListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
