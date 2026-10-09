import { Injectable, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type DemoRoleId = 'super-admin' | 'manager' | 'employee';

export interface RoleContext {
  role: 'Super Admin' | 'Manager' | 'Employee';
  employee_id: string;
  employee_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleStateService {
  readonly selectedRoleId = signal<DemoRoleId>('super-admin');
  readonly selectedEmployeeId = signal<string>('');
  readonly selectedEmployeeName = signal<string>('');
  readonly selectedManagerId = signal<string>('');
  readonly selectedManagerName = signal<string>('');

  private lastContextKey = 'Super Admin:001';
  readonly identityChange$ = new Subject<RoleContext>();

  readonly selectedRoleLabel = computed<'Super Admin' | 'Manager' | 'Employee'>(() => {
    switch (this.selectedRoleId()) {
      case 'super-admin':
        return 'Super Admin';
      case 'manager':
        return 'Manager';
      case 'employee':
      default:
        return 'Employee';
    }
  });

  readonly activeRoleContext = computed<RoleContext>(() => {
    const role = this.selectedRoleLabel();
    if (role === 'Super Admin') {
      return {
        role: 'Super Admin',
        employee_id: '001',
        employee_name: 'Super Admin'
      };
    }
    if (role === 'Manager') {
      return {
        role: 'Manager',
        employee_id: this.selectedManagerId() || '003',
        employee_name: this.selectedManagerName() || 'Arun Kumar'
      };
    }
    return {
      role: 'Employee',
      employee_id: this.selectedEmployeeId() || '001',
      employee_name: this.selectedEmployeeName() || 'Asha Rao'
    };
  });

  readonly activeIdentityLabel = computed<string>(() => {
    const role = this.selectedRoleLabel();
    if (role === 'Super Admin') {
      return 'Role: Super Admin';
    }
    if (role === 'Manager') {
      const name = this.selectedManagerName() || 'Arun Kumar';
      return `Role: Manager (${name})`;
    }
    const name = this.selectedEmployeeName() || 'Asha Rao';
    return `Role: Employee (${name})`;
  });

  setRole(roleId: DemoRoleId): void {
    if (this.selectedRoleId() === roleId) {
      return;
    }
    this.selectedRoleId.set(roleId);
    if (roleId === 'super-admin') {
      this.selectedEmployeeId.set('');
      this.selectedEmployeeName.set('');
      this.selectedManagerId.set('');
      this.selectedManagerName.set('');
    } else if (roleId === 'manager') {
      this.selectedEmployeeId.set('');
      this.selectedEmployeeName.set('');
      if (!this.selectedManagerId()) {
        this.selectedManagerId.set('003');
        this.selectedManagerName.set('Arun Kumar');
      }
    } else if (roleId === 'employee') {
      this.selectedManagerId.set('');
      this.selectedManagerName.set('');
      if (!this.selectedEmployeeId()) {
        this.selectedEmployeeId.set('001');
        this.selectedEmployeeName.set('Asha Rao');
      }
    }
    this.notifyIfContextChanged();
  }

  setEmployee(employeeId: string, employeeName: string): void {
    this.selectedEmployeeId.set(employeeId);
    this.selectedEmployeeName.set(employeeName);
    this.notifyIfContextChanged();
  }

  setManager(managerId: string, managerName: string): void {
    this.selectedManagerId.set(managerId);
    this.selectedManagerName.set(managerName);
    this.notifyIfContextChanged();
  }

  private notifyIfContextChanged(): void {
    const ctx = this.activeRoleContext();
    const key = `${ctx.role}:${ctx.employee_id}`;
    if (key !== this.lastContextKey) {
      this.lastContextKey = key;
      this.identityChange$.next(ctx);
    }
  }
}
