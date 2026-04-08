import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SiteSettings } from '../models/site-settings.model';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

const API = environment.financeTrackerAPI;

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private http = inject(HttpClient);

  getSettings(): Promise<SiteSettings> {
    return firstValueFrom(
      this.http.get<ApiResponse<SiteSettings>>(`${API}/api/site-settings`)
    ).then(r => r.data!);
  }

  updateSettings(dto: SiteSettings): Promise<SiteSettings> {
    return firstValueFrom(
      this.http.put<ApiResponse<SiteSettings>>(`${API}/api/site-settings`, dto)
    ).then(r => r.data!);
  }
}
