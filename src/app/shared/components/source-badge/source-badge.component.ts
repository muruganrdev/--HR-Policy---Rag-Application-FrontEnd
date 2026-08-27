import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicySource } from '../../../core/models/chat.model';

@Component({
  selector: 'app-source-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-badge.component.html',
  styleUrl: './source-badge.component.scss'
})
export class SourceBadgeComponent {
  @Input({ required: true }) source!: PolicySource;

  getDocumentIcon(filename: string): string {
    if (filename.includes('leave')) return '🌴';
    if (filename.includes('attendance')) return '⏰';
    if (filename.includes('home')) return '💻';
    if (filename.includes('hours')) return '⏱️';
    if (filename.includes('conduct')) return '⚖️';
    if (filename.includes('notice')) return '📋';
    return '📄';
  }

  getCleanFilename(filename: string): string {
    return filename.replace('.pdf', '').replace(/_/g, ' ');
  }
}
