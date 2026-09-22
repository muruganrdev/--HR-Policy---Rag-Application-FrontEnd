import { Routes } from '@angular/router';
import { ChatComponent } from './features/chat/chat.component';
import { PolicyExplorerComponent } from './features/policy-explorer/policy-explorer.component';
import { ArchitectureViewComponent } from './features/architecture-view/architecture-view.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent, title: 'AI Assistant — ACME HR Policies' },
  { path: 'explorer', component: PolicyExplorerComponent, title: 'Policy Catalog — ACME HR' },
  { path: 'architecture', component: ArchitectureViewComponent, title: 'RAG Pipeline Architecture' },
  { path: '**', redirectTo: 'chat' }
];
