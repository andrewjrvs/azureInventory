import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styles: ['.vid { width: 50%; height: 50%; }']
})
export class LandingComponent implements OnInit {

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void { }
}
