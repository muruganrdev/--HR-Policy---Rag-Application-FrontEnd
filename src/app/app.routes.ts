import { Routes } from '@angular/router';
import { ChatComponent } from './features/chat/chat.component';
import { PolicyExplorerComponent } from './features/policy-explorer/policy-explorer.component';
import { ArchitectureViewComponent } from './features/architecture-view/architecture-view.component';
import { RoleAccessComponent } from './features/role-access/role-access.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent, title: 'AI Assistant — ACME HR Policies' },
  { path: 'explorer', component: PolicyExplorerComponent, title: 'Policy Catalog — ACME HR' },
  { path: 'architecture', component: ArchitectureViewComponent, title: 'RAG Pipeline Architecture' },
  { path: 'role-access', component: RoleAccessComponent, title: 'Role Access — ACME HR' },
  { path: '**', redirectTo: 'chat' }
];
