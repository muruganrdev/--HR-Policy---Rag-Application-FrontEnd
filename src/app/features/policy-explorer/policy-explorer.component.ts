import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { POLICY_DOCUMENTS_CATALOG, POLICY_CATEGORIES } from '../../core/constants/policy.constants';
import { ChatStateService } from '../../core/services/chat-state.service';
import { PolicyDocumentMeta } from '../../core/models/policy.model';

@Component({
  selector: 'app-policy-explorer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policy-explorer.component.html',
  styleUrl: './policy-explorer.component.scss'
})
export class PolicyExplorerComponent {
  private readonly router = inject(Router);
  private readonly chatState = inject(ChatStateService);

  readonly catalog = POLICY_DOCUMENTS_CATALOG;
  readonly categories = POLICY_CATEGORIES;
  selectedCategory = 'all';

  get filteredCatalog(): PolicyDocumentMeta[] {
    if (this.selectedCategory === 'all') return this.catalog;
    return this.catalog.filter(doc => doc.category === this.selectedCategory);
  }

  filterByCategory(catId: string): void {
    this.selectedCategory = catId;
  }

  queryAboutDoc(doc: PolicyDocumentMeta): void {
    const prompt = `What are the key provisions, rules, and entitlements in ${doc.title}?`;
    this.chatState.sendQuestion(prompt);
    this.router.navigate(['/chat']);
  }
}
