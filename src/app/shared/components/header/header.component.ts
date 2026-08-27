import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatStateService } from '../../../core/services/chat-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly chatState = inject(ChatStateService);
  readonly backendHealth = this.chatState.backendHealth;

  retryConnection(): void {
    this.chatState.verifyBackendHealth();
  }
}
