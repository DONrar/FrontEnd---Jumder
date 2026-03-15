import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TorneoDetailPage } from './torneo-detail.page';

describe('TorneoDetailPage', () => {
  let component: TorneoDetailPage;
  let fixture: ComponentFixture<TorneoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TorneoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
