import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cover Printer';

  // Paper sizes in cm
  paperSizes = [
    { label: '10×15 cm', width: 10, height: 15 },
    { label: '13×18 cm', width: 13, height: 18 }
  ];
  selectedPaperSize = this.paperSizes[0];

  // Picture dimensions in mm
  pictureWidth = 45;
  pictureHeight = 45;

  // Spacing in mm
  margins = 5;
  spacing = 2;

  // Calculated grid
  rows = 0;
  columns = 0;
  placeholders: any[] = [];

  ngOnInit() {
    this.calculateGrid();
  }

  onPaperSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedPaperSize = this.paperSizes[parseInt(select.value)];
    this.calculateGrid();
  }

  onParameterChange() {
    this.calculateGrid();
  }

  calculateGrid() {
    // Convert measurements to pixels at 300 DPI (1 cm = 118.11 pixels)
    const DPI_RATIO = 118.11;

    const paperWidthPx = this.selectedPaperSize.width * DPI_RATIO;
    const paperHeightPx = this.selectedPaperSize.height * DPI_RATIO;
    const pictureWidthPx = (this.pictureWidth / 10) * DPI_RATIO;
    const pictureHeightPx = (this.pictureHeight / 10) * DPI_RATIO;
    const marginPx = (this.margins / 10) * DPI_RATIO;
    const spacingPx = (this.spacing / 10) * DPI_RATIO;

    // Calculate available space
    const availableWidth = paperWidthPx - (2 * marginPx);
    const availableHeight = paperHeightPx - (2 * marginPx);

    // Calculate how many pictures fit
    this.columns = Math.floor((availableWidth + spacingPx) / (pictureWidthPx + spacingPx));
    this.rows = Math.floor((availableHeight + spacingPx) / (pictureHeightPx + spacingPx));

    // Generate placeholder array
    const totalPlaceholders = this.rows * this.columns;
    this.placeholders = Array(totalPlaceholders).fill(null).map((_, index) => ({
      id: index,
      image: null
    }));
  }
}
