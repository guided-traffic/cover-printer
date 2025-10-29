import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlaceholderState {
  id: number;
  imageData: string | null;
  offsetX: number;
  offsetY: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
  left: number;
  top: number;
  isDragOver?: boolean;
  isDraggingImage?: boolean;
}

interface DragState {
  active: boolean;
  placeholderId: number | null;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
}

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
  placeholders: PlaceholderState[] = [];

  // Grid offset for centering (in mm)
  offsetX = 0;
  offsetY = 0;

  // Drag state for image positioning
  private dragState: DragState = {
    active: false,
    placeholderId: null,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0
  };

  ngOnInit() {
    this.calculateGrid();

    // Add global mouse event listeners for image dragging
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
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
        imageData: null,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        imageWidth: 0,
        imageHeight: 0,
        // Calculate position in mm
        left: this.offsetX + (col * (pictureWidthMm + spacingMm)),
        top: this.offsetY + (row * (pictureHeightMm + spacingMm)),
        isDragOver: false
      };
    });
  }

  // Drag and drop event handlers
  onDragOver(event: DragEvent, placeholder: PlaceholderState) {
    event.preventDefault();
    event.stopPropagation();
    placeholder.isDragOver = true;
  }

  onDragLeave(event: DragEvent, placeholder: PlaceholderState) {
    event.preventDefault();
    event.stopPropagation();
    placeholder.isDragOver = false;
  }

  onDrop(event: DragEvent, placeholder: PlaceholderState) {
    event.preventDefault();
    event.stopPropagation();
    placeholder.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if file is an image
      if (file.type.startsWith('image/')) {
        this.loadImage(file, placeholder);
      }
    }
  }

  loadImage(file: File, placeholder: PlaceholderState) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Store image data and dimensions
        placeholder.imageData = e.target?.result as string;
        placeholder.imageWidth = img.width;
        placeholder.imageHeight = img.height;

        // Calculate initial scale to fit the image in the placeholder
        // Convert placeholder dimensions from mm to pixels (at 300 DPI: 1mm = 11.811 pixels)
        const placeholderWidthPx = this.pictureWidth * 11.811;
        const placeholderHeightPx = this.pictureHeight * 11.811;

        // Calculate scale to cover the placeholder (like CSS background-size: cover)
        const scaleX = placeholderWidthPx / img.width;
        const scaleY = placeholderHeightPx / img.height;
        const initialScale = Math.max(scaleX, scaleY);

        placeholder.offsetX = 0;
        placeholder.offsetY = 0;
        placeholder.scale = initialScale;
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }  clearImage(event: Event, placeholder: PlaceholderState) {
    event.stopPropagation();
    placeholder.imageData = null;
    placeholder.offsetX = 0;
    placeholder.offsetY = 0;
    placeholder.scale = 1;
    placeholder.imageWidth = 0;
    placeholder.imageHeight = 0;
  }

  // Image dragging handlers
  onImageMouseDown(event: MouseEvent, placeholder: PlaceholderState) {
    // Only start dragging if there's an image
    if (!placeholder.imageData) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Initialize drag state
    this.dragState = {
      active: true,
      placeholderId: placeholder.id,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: placeholder.offsetX,
      startOffsetY: placeholder.offsetY
    };

    placeholder.isDraggingImage = true;
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.dragState.active || this.dragState.placeholderId === null) {
      return;
    }

    // Find the placeholder being dragged
    const placeholder = this.placeholders.find(p => p.id === this.dragState.placeholderId);
    if (!placeholder) {
      return;
    }

    // Calculate delta from drag start
    const deltaX = event.clientX - this.dragState.startX;
    const deltaY = event.clientY - this.dragState.startY;

    // Update image offset
    placeholder.offsetX = this.dragState.startOffsetX + deltaX;
    placeholder.offsetY = this.dragState.startOffsetY + deltaY;
  }

  private onMouseUp(event: MouseEvent) {
    if (this.dragState.active && this.dragState.placeholderId !== null) {
      const placeholder = this.placeholders.find(p => p.id === this.dragState.placeholderId);
      if (placeholder) {
        placeholder.isDraggingImage = false;
      }
    }

    // Reset drag state
    this.dragState = {
      active: false,
      placeholderId: null,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0
    };
  }
}
