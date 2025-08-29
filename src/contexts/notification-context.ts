import { createContext } from 'react';

export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'hearing' | 'reminder' | 'info';
  date: Date;
  caseId: string;
  departmentName: string;
  subDepartmentName: string;
}

export interface NotificationContextType {
  notifications: NotificationType[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
