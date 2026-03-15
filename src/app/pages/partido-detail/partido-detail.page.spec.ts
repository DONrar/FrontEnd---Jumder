import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartidoDetailPage } from './partido-detail.page';

describe('PartidoDetailPage', () => {
  let component: PartidoDetailPage;
  let fixture: ComponentFixture<PartidoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartidoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
