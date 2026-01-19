import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

/**
 * Directive to highlight the currently playing song
 * Usage: <div [appHighlightPlaying]="isPlaying">
 */
@Directive({
  selector: '[appHighlightPlaying]',
  standalone: true
})
export class HighlightPlayingDirective implements OnChanges {
  @Input() appHighlightPlaying: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    if (this.appHighlightPlaying) {
      this.renderer.addClass(this.el.nativeElement, 'highlight-playing');
      this.renderer.setStyle(this.el.nativeElement, 'background-color', 'var(--accent-color-light, rgba(156, 39, 176, 0.1))');
      this.renderer.setStyle(this.el.nativeElement, 'border-left', '4px solid var(--accent-color)');
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'highlight-playing');
      this.renderer.removeStyle(this.el.nativeElement, 'background-color');
      this.renderer.removeStyle(this.el.nativeElement, 'border-left');
    }
  }
}
