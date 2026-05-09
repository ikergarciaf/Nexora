export interface DashboardViewProps {
  isDarkMode: boolean;
  onNavigate: (view: string) => void;
}

export interface DashboardViewWithConfigProps extends DashboardViewProps {
  clinicConfig: any;
  onUpdateConfig: (config: any) => void;
  tenantConfig?: any;
}
