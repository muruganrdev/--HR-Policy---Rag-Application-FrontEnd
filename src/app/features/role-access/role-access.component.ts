import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { RoleStateService } from '../../core/services/role-state.service';

interface RoleDefinition {
  id: 'super-admin' | 'manager' | 'employee';
  label: string;
  permissions: string[];
  scope: string;
  note: string;
}

interface EmployeeRecord {
  employee_id: string;
  employee_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employment_type: string;
  employment_status: string;
  date_of_joining: string;
  tenure_years: number;
  manager_name: string;
  location: string;
  jurisdiction: string;
  leave_balance: number;
  sick_leave_balance: number;
  annual_salary: number;
  work_mode: string;
}

interface EmployeeListResponse {
  employees: EmployeeRecord[];
  employee_names: string[];
  scope: string;
}

interface EmployeeOption {
  employee_id: string;
  employee_name: string;
}

interface EmployeeOptionsResponse {
  employees: EmployeeOption[];
}

interface ManagerOption {
  manager_name: string;
  employee_id: string;
}

interface ManagerListResponse {
  managers: ManagerOption[];
}

const ROLE_DEFINITIONS: Record<RoleDefinition['id'], RoleDefinition> = {
  'super-admin': {
    id: 'super-admin',
    label: 'Super Admin',
    permissions: [
      'View employees: Allowed',
      'Create employee: Allowed',
      'Update employee: Allowed',
      'Delete employee: Allowed'
    ],
    scope: 'All employees',
    note: 'Super Admin access requires a trusted authenticated identity.'
  },
  manager: {
    id: 'manager',
    label: 'Manager',
    permissions: [
      'View employees: Allowed'
    ],
    scope: 'Team / supported view',
    note: 'The selected Manager role is restricted to team-supported employee data.'
  },
  employee: {
    id: 'employee',
    label: 'Employee',
    permissions: [
      'You have access to see {employee}\'s records and general details.'
    ],
    scope: 'Own demo identity',
    note: 'The selected Employee role is limited to its own demo identity.'
  }
};

@Component({
  selector: 'app-role-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-access.component.html',
  styleUrl: './role-access.component.scss'
})
export class RoleAccessComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly roleState = inject(RoleStateService);
  private requestSequence = 0;

  readonly roles = Object.values(ROLE_DEFINITIONS);
  readonly employees = signal<EmployeeRecord[]>([]);
  readonly employeeOptions = signal<EmployeeOption[]>([]);
  readonly managers = signal<ManagerOption[]>([]);
  readonly selectedRole = signal<RoleDefinition['id']>(this.roleState.selectedRoleId());
  readonly selectedEmployeeId = signal<string>(this.roleState.selectedEmployeeId());
  readonly selectedManagerId = signal<string>(this.roleState.selectedManagerId());
  readonly roleDefinition = computed(() => ROLE_DEFINITIONS[this.selectedRole()]);
  readonly permissions = computed(() => this.roleDefinition().permissions);
  readonly scopeSummary = computed(() => this.roleDefinition().scope);
  readonly isLoading = signal(false);
  readonly statusMessage = signal('');
  readonly errorMessage = signal('');
  readonly selectedEmployee = computed(() => {
    return this.employees().find(record => record.employee_id === this.selectedEmployeeId()) ?? null;
  });
  readonly canCreate = computed(() => false);
  readonly canUpdate = computed(() => false);
  readonly canDelete = computed(() => false);
  readonly employeeAccessMessage = computed(() => {
    const employee = this.selectedEmployee();
    return employee ? `You have access to see ${employee.employee_name}'s records and general details.` : '';
  });

  ngOnInit(): void {
    const currentRole = this.roleState.selectedRoleId();
    this.selectedRole.set(currentRole);
    this.selectedEmployeeId.set(this.roleState.selectedEmployeeId());
    this.selectedManagerId.set(this.roleState.selectedManagerId());

    if (currentRole === 'manager') {
      this.loadManagers();
    } else if (currentRole === 'employee') {
      this.loadEmployeeOptions();
    }
  }

  selectRole(roleId: RoleDefinition['id']): void {
    this.requestSequence += 1;
    this.selectedRole.set(roleId);
    this.roleState.setRole(roleId);
    this.selectedEmployeeId.set('');
    this.selectedManagerId.set('');
    this.employees.set([]);
    this.employeeOptions.set([]);
    this.managers.set([]);
    this.clearMessages();
    if (roleId === 'super-admin') {
      this.isLoading.set(false);
      this.showAccessDenied('Super Admin access requires a trusted authenticated identity.');
      return;
    }
    if (roleId === 'manager') {
      this.loadManagers();
      return;
    }
    this.loadEmployeeOptions();
  }

  selectEmployee(employeeId: string): void {
    if (this.selectedRole() !== 'employee') return;
    const emp = this.employeeOptions().find(employee => employee.employee_id === employeeId);
    if (!emp) return;
    this.selectedEmployeeId.set(employeeId);
    this.roleState.setEmployee(emp.employee_id, emp.employee_name);
    this.employees.set([]);
    this.clearMessages();
    this.loadEmployeeRecords(employeeId);
  }

  selectManager(employeeId: string): void {
    const mgr = this.managers().find(manager => manager.employee_id === employeeId);
    if (!mgr) return;
    this.selectedManagerId.set(employeeId);
    this.roleState.setManager(mgr.employee_id, mgr.manager_name);
    this.selectedEmployeeId.set('');
    this.employees.set([]);
    this.clearMessages();
    this.loadEmployeeRecords(employeeId);
  }

  selectedRoleLabel(): string {
    return this.roleDefinition().label;
  }

  createEmployee(): void {
    if (!this.canCreate()) return;
    const employee = this.selectedEmployee();
    if (!employee) return;
    const payload = {
      role: this.selectedRoleLabel(),
      employee_id: '001',
      employee_name: employee.employee_name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      employment_type: employee.employment_type,
      employment_status: employee.employment_status,
      date_of_joining: employee.date_of_joining,
      tenure_years: employee.tenure_years,
      manager_name: employee.manager_name,
      location: employee.location,
      jurisdiction: employee.jurisdiction,
      leave_balance: employee.leave_balance,
      sick_leave_balance: employee.sick_leave_balance,
      annual_salary: employee.annual_salary,
      work_mode: employee.work_mode
    };

    this.isLoading.set(true);
    this.http.post<{ employee: EmployeeRecord; message: string }>('http://localhost:8001/role-access/employees', payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => this.handleSuccess(response.message, response.employee),
        error: error => this.handleError(error)
      });
  }

  updateEmployee(): void {
    if (!this.canUpdate()) return;
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.isLoading.set(true);
    this.http.put<{ employee: EmployeeRecord; message: string }>(`http://localhost:8001/role-access/employees/${employee.employee_id}`, {
      role: this.selectedRoleLabel(),
      employee_id: '001',
      employee_name: employee.employee_name,
      designation: employee.designation,
      department: employee.department,
      leave_balance: employee.leave_balance
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => this.handleSuccess(response.message, response.employee),
        error: error => this.handleError(error)
      });
  }

  deleteEmployee(): void {
    if (!this.canDelete()) return;
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.isLoading.set(true);
    this.http.delete<{ deleted_employee_id: string; message: string }>(`http://localhost:8001/role-access/employees/${employee.employee_id}`, {
      body: { role: this.selectedRoleLabel(), employee_id: '001' }
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => this.handleSuccess(response.message),
        error: error => this.handleError(error)
      });
  }

  private loadManagers(): void {
    const requestSequence = ++this.requestSequence;
    const requestRole = this.selectedRole();
    this.isLoading.set(true);
    this.http.get<ManagerListResponse>('http://localhost:8001/role-access/managers')
      .pipe(finalize(() => {
        if (requestSequence === this.requestSequence) this.isLoading.set(false);
      }))
      .subscribe({
        next: response => {
          if (requestSequence !== this.requestSequence || this.selectedRole() !== requestRole) return;
          this.managers.set(response.managers);
          if (response.managers.length === 0) {
            this.showAccessDenied('No demo managers are currently available.');
            return;
          }
          const currentMgrId = this.selectedManagerId() || this.roleState.selectedManagerId();
          const selected = response.managers.find(m => m.employee_id === currentMgrId) ?? response.managers[0];
          this.selectedManagerId.set(selected.employee_id);
          this.roleState.setManager(selected.employee_id, selected.manager_name);
          this.loadEmployeeRecords(selected.employee_id);
        },
        error: error => this.handleError(error)
      });
  }

  private loadEmployeeOptions(): void {
    const requestSequence = ++this.requestSequence;
    const requestRole = this.selectedRole();
    const identityId = this.selectedEmployeeId() || this.roleState.selectedEmployeeId() || '001';
    this.isLoading.set(true);
    this.clearMessages();
    this.http.get<EmployeeOptionsResponse>('http://localhost:8001/role-access/employee-options', {
      params: { role: 'Employee', employee_id: identityId }
    })
      .pipe(finalize(() => {
        if (requestSequence === this.requestSequence) this.isLoading.set(false);
      }))
      .subscribe({
        next: response => {
          if (requestSequence !== this.requestSequence || this.selectedRole() !== requestRole) return;
          const uniqueOptions = Array.from(
            new Map(response.employees.map(employee => [employee.employee_id, employee])).values()
          );
          this.employeeOptions.set(uniqueOptions);
          const currentEmpId = this.selectedEmployeeId() || this.roleState.selectedEmployeeId();
          const currentSelection = uniqueOptions.find(employee => employee.employee_id === currentEmpId);
          const selected = currentSelection ?? uniqueOptions[0];
          if (!selected) {
            this.selectedEmployeeId.set('');
            this.employees.set([]);
            this.showAccessDenied('No employees are available for this identity.');
            return;
          }
          this.selectedEmployeeId.set(selected.employee_id);
          this.roleState.setEmployee(selected.employee_id, selected.employee_name);
          this.loadEmployeeRecords(selected.employee_id);
        },
        error: error => this.handleError(error)
      });
  }

  private loadEmployeeRecords(identityId?: string): void {
    const requestSequence = ++this.requestSequence;
    const requestRole = this.selectedRole();
    const role = this.selectedRoleLabel();
    const employeeId = requestRole === 'manager'
      ? identityId || this.selectedManagerId()
      : identityId || this.selectedEmployeeId() || '001';
    this.isLoading.set(true);
    this.clearMessages();
    this.http.get<EmployeeListResponse>('http://localhost:8001/role-access/employees', {
      params: { role, employee_id: employeeId }
    })
      .pipe(finalize(() => {
        if (requestSequence === this.requestSequence) this.isLoading.set(false);
      }))
      .subscribe({
        next: response => {
          if (requestSequence !== this.requestSequence || this.selectedRole() !== requestRole) return;
          if (requestRole === 'manager' && this.selectedManagerId() !== employeeId) return;
          this.employees.set(response.employees);
          if (requestRole === 'employee' && response.employees.length > 0 && !this.selectedEmployeeId()) {
            this.selectedEmployeeId.set(response.employees[0].employee_id);
          }
          if (requestRole === 'employee' && this.selectedEmployeeId()) {
            const employee = response.employees.find(record => record.employee_id === this.selectedEmployeeId());
            if (!employee) {
              this.showAccessDenied('Employee role cannot access another employee through the UI.');
            }
          }
          this.statusMessage.set(`Loaded ${response.employees.length} employee record(s). Scope: ${response.scope}.`);
        },
        error: error => this.handleError(error)
      });
  }

  private handleSuccess(message: string, employee?: EmployeeRecord): void {
    this.statusMessage.set(message);
    this.errorMessage.set('');
    if (employee) {
      this.employees.update(records => records.map(record => record.employee_id === employee.employee_id ? employee : record));
      this.selectedEmployeeId.set(employee.employee_id);
    }
    this.loadEmployeeRecords();
  }

  private showAccessDenied(message: string): void {
    this.errorMessage.set(message);
    this.statusMessage.set('');
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 403) {
      this.showAccessDenied('Access denied: your selected role does not have permission to perform this operation.');
      return;
    }
    if (error.status === 404) {
      this.showAccessDenied('Employee not found.');
      return;
    }
    if (error.status === 422) {
      const detail = error.error?.detail;
      this.showAccessDenied(Array.isArray(detail) ? detail.map(item => item.msg).join('. ') : 'Validation failed.');
      return;
    }
    this.showAccessDenied(error.error?.detail || 'Unable to complete the requested employee operation.');
  }

  private clearMessages(): void {
    this.statusMessage.set('');
    this.errorMessage.set('');
  }
}
