import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

/**
 * Directive to animate album artwork (rotate) when playing
 * Usage: <img [appAlbumAnimate]="isPlaying">
 */
@Directive({
  selector: '[appAlbumAnimate]',
  standalone: true
})
export class AlbumAnimateDirective implements OnChanges {
  @Input() appAlbumAnimate: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    if (this.appAlbumAnimate) {
      this.renderer.addClass(this.el.nativeElement, 'album-rotating');
      this.renderer.setStyle(this.el.nativeElement, 'animation', 'rotate 20s linear infinite');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'album-rotating');
      this.renderer.removeStyle(this.el.nativeElement, 'animation');
    }
  }
}
