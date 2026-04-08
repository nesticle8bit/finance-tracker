import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminService, AdminCreateUser, AdminUpdateUser } from '../../../services/admin.service';
import { AuthUser } from '../../../models/auth.model';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';

const API = environment.financeTrackerAPI;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly users = signal<AuthUser[]>([]);
  readonly loading = signal(false);
  readonly showDialog = signal(false);
  readonly editingUser = signal<AuthUser | null>(null);
  readonly saving = signal(false);
  readonly deleting = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);
  readonly avatarFile = signal<File | null>(null);
  readonly uploadingAvatar = signal(false);

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    role:     ['user' as 'user' | 'admin', Validators.required],
    password: [''],
  });

  readonly dialogInitials = computed(() => {
    const name = this.form.get('name')?.value || this.editingUser()?.name || '?';
    return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  });

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      this.users.set(await this.adminService.getUsers());
    } catch {
      this.toast.error('Error cargando usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.avatarPreview.set(null);
    this.avatarFile.set(null);
    this.form.reset({ name: '', email: '', role: 'user', password: '' });
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')!.updateValueAndValidity();
    this.showDialog.set(true);
  }

  openEdit(user: AuthUser): void {
    this.editingUser.set(user);
    this.avatarFile.set(null);
    this.avatarPreview.set(user.avatarUrl ? `${API}${user.avatarUrl.split('?')[0]}` : null);
    this.form.reset({ name: user.name, email: user.email, role: user.role, password: '' });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingUser.set(null);
    this.avatarPreview.set(null);
    this.avatarFile.set(null);
  }

  pickAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.avatarFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    try {
      const editing = this.editingUser();
      let savedUser: AuthUser;

      if (editing) {
        const dto: AdminUpdateUser = {
          name:  this.form.value.name!,
          email: this.form.value.email!,
          role:  this.form.value.role as 'user' | 'admin',
        };
        if (this.form.value.password) dto.password = this.form.value.password;
        savedUser = await this.adminService.updateUser(editing.id, dto);
        this.toast.success('Usuario actualizado');
      } else {
        const dto: AdminCreateUser = {
          name:     this.form.value.name!,
          email:    this.form.value.email!,
          role:     this.form.value.role as 'user' | 'admin',
          password: this.form.value.password!,
        };
        savedUser = await this.adminService.createUser(dto);
        this.toast.success('Usuario creado');
      }

      // Upload avatar if one was selected
      if (this.avatarFile()) {
        this.uploadingAvatar.set(true);
        try {
          await this.adminService.uploadAvatar(savedUser.id, this.avatarFile()!);
        } catch {
          this.toast.error('Error subiendo imagen de perfil');
        } finally {
          this.uploadingAvatar.set(false);
        }
      }

      this.closeDialog();
      await this.loadUsers();
    } catch (e: any) {
      this.toast.error(e?.error?.errors?.[0] ?? 'Error guardando usuario');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteUser(user: AuthUser): Promise<void> {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;
    this.deleting.set(user.id);
    try {
      await this.adminService.deleteUser(user.id);
      this.toast.success('Usuario eliminado');
      await this.loadUsers();
    } catch {
      this.toast.error('Error eliminando usuario');
    } finally {
      this.deleting.set(null);
    }
  }

  avatarSrc(user: AuthUser): string | null {
    return user.avatarUrl ? `${API}${user.avatarUrl.split('?')[0]}?t=${Date.now()}` : null;
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  isOnline(user: AuthUser): boolean {
    if (!user.lastSeenAt) return false;
    return (Date.now() - new Date(user.lastSeenAt).getTime()) < 5 * 60 * 1000;
  }

  get isEditing(): boolean { return this.editingUser() !== null; }
}
