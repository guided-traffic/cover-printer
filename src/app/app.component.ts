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
  margins = 4;
  spacing = 2;

  // Calculated grid
  rows = 0;
  columns = 0;
  placeholders: any[] = [];

  // Grid offset for centering (in mm)
  offsetX = 0;
  offsetY = 0;

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
    // Convert all measurements to mm for consistency
    const paperWidthMm = this.selectedPaperSize.width * 10; // cm to mm
    const paperHeightMm = this.selectedPaperSize.height * 10; // cm to mm
    const pictureWidthMm = this.pictureWidth;
    const pictureHeightMm = this.pictureHeight;
    const marginMm = this.margins;
    const spacingMm = this.spacing;

    // Calculate available space (subtracting margins from both sides)
    const availableWidth = paperWidthMm - (2 * marginMm);
    const availableHeight = paperHeightMm - (2 * marginMm);

    // Calculate how many pictures fit
    // Formula: floor((available + spacing) / (picture + spacing))
    // The spacing is added to available because the last picture doesn't need spacing after it
    this.columns = Math.floor((availableWidth + spacingMm) / (pictureWidthMm + spacingMm));
    this.rows = Math.floor((availableHeight + spacingMm) / (pictureHeightMm + spacingMm));

    // Calculate total grid dimensions (without the trailing spacing)
    const totalGridWidth = (this.columns * pictureWidthMm) + ((this.columns - 1) * spacingMm);
    const totalGridHeight = (this.rows * pictureHeightMm) + ((this.rows - 1) * spacingMm);

    // Center the grid within available space
    this.offsetX = marginMm + (availableWidth - totalGridWidth) / 2;
    this.offsetY = marginMm + (availableHeight - totalGridHeight) / 2;

    // Generate placeholder array with position information
    const totalPlaceholders = this.rows * this.columns;
    this.placeholders = Array(totalPlaceholders).fill(null).map((_, index) => {
      const row = Math.floor(index / this.columns);
      const col = index % this.columns;

      return {
        id: index,
        image: null,
        // Calculate position in mm
        left: this.offsetX + (col * (pictureWidthMm + spacingMm)),
        top: this.offsetY + (row * (pictureHeightMm + spacingMm))
      };
    });
  }
}
