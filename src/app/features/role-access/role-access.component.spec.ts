import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { routes as appRoutes } from '../../app.routes';
import { RoleAccessComponent } from './role-access.component';
import { RoleStateService } from '../../core/services/role-state.service';
import { vi } from 'vitest';

describe('RoleAccessComponent', () => {
  let fixture: ComponentFixture<RoleAccessComponent>;
  let component: RoleAccessComponent;
  let httpTesting: HttpTestingController;
  let roleState: RoleStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAccessComponent, HttpClientTestingModule],
      providers: [
        provideRouter(appRoutes),
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleAccessComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    roleState = TestBed.inject(RoleStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushEmployeeOptions(): void {
    const request = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employee-options')
    );
    expect(request.request.params.get('role')).toBe('Employee');
    expect(request.request.params.get('employee_id')).toBe('001');
    request.flush({
      employees: [
        { employee_id: '001', employee_name: 'Asha Rao' },
        { employee_id: '002', employee_name: 'Vikram Shah' },
        { employee_id: '003', employee_name: 'Neha Iyer' },
        { employee_id: '004', employee_name: 'Arjun Menon' },
        { employee_id: '005', employee_name: 'Priya Nair' },
        { employee_id: '006', employee_name: 'Rahul Das' }
      ]
    });
  }

  function flushEmployeeList(employeeId: string, employeeName = 'Asha Rao'): void {
    const request = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    expect(request.request.params.get('role')).toBe(component.selectedRoleLabel());
    expect(request.request.params.get('employee_id')).toBe(employeeId);
    request.flush({
      employees: [{ employee_id: employeeId, employee_name: employeeName }],
      employee_names: [employeeName],
      scope: component.selectedRole() === 'manager' ? 'team / supported view' : 'own demo identity'
    });
  }

  function managerOptionsRequest() {
    const request = httpTesting.expectOne('http://localhost:8001/role-access/managers');
    expect(request.request.method).toBe('GET');
    request.flush({
      managers: [
        { manager_name: 'Arun Kumar', employee_id: '003' },
        { manager_name: 'Deepak Sharma', employee_id: '005' }
      ]
    });
  }

  it('defaults to Super Admin role with employee dropdown hidden', () => {
    expect(component.selectedRole()).toBe('super-admin');
    expect(document.querySelector('#employee-select')).toBeNull();
    expect(document.querySelector('#manager-select')).toBeNull();
    expect(component.selectedEmployeeId()).toBe('');
  });

  it('loads and shows Employee dropdown when Employee role is selected', () => {
    component.selectRole('employee');
    flushEmployeeOptions();
    flushEmployeeList('001');
    fixture.detectChanges();

    expect(component.selectedRole()).toBe('employee');
    expect(document.querySelector('#employee-select')).not.toBeNull();
    expect(document.querySelector('#manager-select')).toBeNull();
    expect(component.employees().map(employee => employee.employee_name)).toEqual(['Asha Rao']);
    expect(document.body.textContent).toContain('Choose Employee');
    expect(document.body.textContent).toContain("You have access to see Asha Rao's records and general details.");
    const options = Array.from(document.querySelectorAll<HTMLSelectElement>('#employee-select option'));
    expect(options.map(option => option.textContent?.trim())).toEqual([
      'Asha Rao', 'Vikram Shah', 'Neha Iyer', 'Arjun Menon', 'Priya Nair', 'Rahul Das'
    ]);
    expect(options.map(option => option.value)).toEqual(['001', '002', '003', '004', '005', '006']);
  });

  it('hides Employee dropdown and resets employee context when switching from Employee to Super Admin', () => {
    component.selectRole('employee');
    flushEmployeeOptions();
    flushEmployeeList('001');
    fixture.detectChanges();

    expect(document.querySelector('#employee-select')).not.toBeNull();

    component.selectRole('super-admin');
    fixture.detectChanges();

    expect(component.selectedRole()).toBe('super-admin');
    expect(document.querySelector('#employee-select')).toBeNull();
    expect(component.selectedEmployeeId()).toBe('');
  });

  it('offers only the backend-provided Arun Kumar and Deepak Sharma manager options and hides Employee dropdown', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');
    fixture.detectChanges();

    expect(document.querySelector('#employee-select')).toBeNull();
    expect(document.querySelector('#manager-select')).not.toBeNull();
    const managerOptions = Array.from(document.querySelectorAll('#manager-select option'))
      .map(option => option.textContent?.trim());
    expect(managerOptions).toEqual(['Arun Kumar', 'Deepak Sharma']);
    expect(document.body.textContent).toContain('Neha Iyer');
  });

  it('loads only Arun Kumar team members when Arun is selected', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    const initialTeam = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    initialTeam.flush({
      employees: [{ employee_id: '003', employee_name: 'Neha Iyer', department: 'Engineering', designation: 'Software Engineer' }],
      employee_names: ['Neha Iyer'],
      scope: 'team / supported view'
    });

    component.selectManager('003');
    const managerRequest = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    expect(managerRequest.request.params.get('role')).toBe('Manager');
    expect(managerRequest.request.params.get('employee_id')).toBe('003');
    managerRequest.flush({
      employees: [
        { employee_id: '003', employee_name: 'Neha Iyer', department: 'Engineering', designation: 'Software Engineer' },
        { employee_id: '004', employee_name: 'Arjun Menon', department: 'Engineering', designation: 'Senior Software Engineer' }
      ],
      employee_names: ['Neha Iyer', 'Arjun Menon'],
      scope: 'team / supported view'
    });
    fixture.detectChanges();

    expect(component.employees().map(employee => employee.employee_name)).toEqual(['Neha Iyer', 'Arjun Menon']);
    expect(document.body.textContent).toContain('Neha Iyer');
    expect(document.body.textContent).toContain('Arjun Menon');
    expect(document.body.textContent).not.toContain('Priya Nair');
  });

  it('uses the selected employee ID for the scoped record request', () => {
    component.selectRole('employee');
    flushEmployeeOptions();
    flushEmployeeList('001');

    component.selectEmployee('002');
    const employeeRequest = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    expect(employeeRequest.request.params.get('role')).toBe('Employee');
    expect(employeeRequest.request.params.get('employee_id')).toBe('002');
    employeeRequest.flush({
      employees: [{ employee_id: '002', employee_name: 'Vikram Shah' }],
      employee_names: ['Vikram Shah'],
      scope: 'own demo identity'
    });
    fixture.detectChanges();

    expect(component.selectedEmployeeId()).toBe('002');
    expect(component.selectedEmployee()?.employee_name).toBe('Vikram Shah');
  });

  it('loads only Deepak Sharma team members when Deepak is selected', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');

    component.selectManager('005');
    const managerRequest = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    expect(managerRequest.request.params.get('employee_id')).toBe('005');
    managerRequest.flush({
      employees: [{ employee_id: '005', employee_name: 'Priya Nair', department: 'Product', designation: 'Product Manager' }],
      employee_names: ['Priya Nair'],
      scope: 'team / supported view'
    });
    fixture.detectChanges();

    expect(component.employees().map(employee => employee.employee_name)).toEqual(['Priya Nair']);
    expect(document.body.textContent).toContain('Priya Nair');
    expect(document.body.textContent).not.toContain('Neha Iyer');
  });

  it('clears manager selection and reloads the Employee identity after changing roles', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');

    component.selectRole('employee');
    flushEmployeeOptions();
    flushEmployeeList('001');

    expect(component.selectedManagerId()).toBe('');
    expect(component.selectedEmployeeId()).toBe('001');
    expect(component.selectedRole()).toBe('employee');
  });

  it('shows the backend error when manager options fail to load', () => {
    component.selectRole('manager');
    const request = httpTesting.expectOne('http://localhost:8001/role-access/managers');
    request.flush({ detail: 'Manager directory unavailable.' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.managers()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Manager directory unavailable.');
    expect(document.body.textContent).toContain('No demo managers are currently available.');
  });

  it('resets manager selection when switching roles and denies unauthenticated Super Admin mode', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');

    component.selectRole('super-admin');
    fixture.detectChanges();

    expect(component.selectedManagerId()).toBe('');
    expect(component.managers()).toEqual([]);
    expect(component.errorMessage()).toContain('trusted authenticated identity');
    expect(document.body.textContent).toContain('Super Admin operations remain unavailable');
    expect(document.querySelector<HTMLButtonElement>('.create-button')?.disabled).toBe(true);
  });

  it('keeps the Role Access route available', () => {
    expect(appRoutes.map(route => route.path)).toEqual(expect.arrayContaining(['role-access']));
    expect(appRoutes).toContainEqual(expect.objectContaining({ path: 'role-access' }));
  });

  it('preserves Manager Arun Kumar when component is recreated without resetting to Super Admin', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');
    fixture.detectChanges();

    expect(component.selectedRole()).toBe('manager');
    expect(component.selectedManagerId()).toBe('003');
    expect(roleState.selectedRoleId()).toBe('manager');
    expect(roleState.selectedManagerId()).toBe('003');

    // Simulate navigating away and recreating the component
    const secondFixture = TestBed.createComponent(RoleAccessComponent);
    secondFixture.detectChanges();

    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');
    secondFixture.detectChanges();

    expect(secondFixture.componentInstance.selectedRole()).toBe('manager');
    expect(secondFixture.componentInstance.selectedManagerId()).toBe('003');
    expect(roleState.selectedRoleId()).toBe('manager');
    expect(roleState.selectedManagerId()).toBe('003');
    expect(roleState.selectedRoleLabel()).toBe('Manager');
  });

  it('preserves Employee Vikram Shah when component is recreated', () => {
    component.selectRole('employee');
    flushEmployeeOptions();
    flushEmployeeList('001');

    component.selectEmployee('002');
    const employeeRequest = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    employeeRequest.flush({
      employees: [{ employee_id: '002', employee_name: 'Vikram Shah' }],
      employee_names: ['Vikram Shah'],
      scope: 'own demo identity'
    });
    fixture.detectChanges();

    expect(roleState.selectedRoleId()).toBe('employee');
    expect(roleState.selectedEmployeeId()).toBe('002');

    // Recreate component (simulating navigation back from AI Assistant)
    const secondFixture = TestBed.createComponent(RoleAccessComponent);
    secondFixture.detectChanges();

    const optionsRequest = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employee-options')
    );
    expect(optionsRequest.request.params.get('employee_id')).toBe('002');
    optionsRequest.flush({
      employees: [
        { employee_id: '001', employee_name: 'Asha Rao' },
        { employee_id: '002', employee_name: 'Vikram Shah' }
      ]
    });

    const secondListRequest = httpTesting.expectOne(request =>
      request.method === 'GET' && request.url.endsWith('/role-access/employees')
    );
    expect(secondListRequest.request.params.get('employee_id')).toBe('002');
    secondListRequest.flush({
      employees: [{ employee_id: '002', employee_name: 'Vikram Shah' }],
      employee_names: ['Vikram Shah'],
      scope: 'own demo identity'
    });
    secondFixture.detectChanges();

    expect(secondFixture.componentInstance.selectedRole()).toBe('employee');
    expect(secondFixture.componentInstance.selectedEmployeeId()).toBe('002');
    expect(roleState.selectedEmployeeId()).toBe('002');
  });

  it('does not emit false identityChange$ when component is recreated with existing Manager selection', () => {
    component.selectRole('manager');
    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');
    fixture.detectChanges();

    const identitySpy = vi.fn();
    const sub = roleState.identityChange$.subscribe(identitySpy);

    // Recreate component
    const secondFixture = TestBed.createComponent(RoleAccessComponent);
    secondFixture.detectChanges();

    managerOptionsRequest();
    flushEmployeeList('003', 'Neha Iyer');
    secondFixture.detectChanges();

    expect(identitySpy).not.toHaveBeenCalled();
    sub.unsubscribe();
  });
});
