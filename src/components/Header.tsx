import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import NotificationViewDetailButton from './department/NotificationViewDetailButton';

interface HeaderProps {
  isLoggedIn: boolean;
  currentLang: 'en' | 'hi';
  toggleLanguage: () => void;
}

type NotificationType = {
  id: string;
  title: string;
  message: string;
  date: Date | string;
  caseId?: string;
  _id?: string;
  petitionername?: string;
  respondentname?: string;
  caseName?: string;
  departmentName?: string;
  subDepartmentName?: string;
  caseNumber?: string; // <-- Added this line
};

const Header: React.FC<HeaderProps> = ({ isLoggedIn, currentLang, toggleLanguage }) => {
  const { notifications, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const translations = {
    en: {
      title: "Ayodhya Court Case Portal",
      home: "Home",
      reports: "Reports",
      subDepartments: "Sub-Departments",
      logout: "Logout",
      login: "Login",
      Print: "Print",
      noNotifications: "No notifications",
      clearAll: "Clear all",
      department: "Department",
      subDepartment: "Sub-Department",
      notifications: "Notifications",
      upcomingHearing: "Upcoming Hearing",
      departmentReport: "Department Report",
      contemptCases: "Contempt Cases"
    },
    hi: {
      title: "डीएम जनसुनवाई पोर्टल",
      home: "होम",
      reports: "रिपोर्ट्स",
      subDepartments: "उप-विभाग",
      logout: "लॉगआउट",
      login: "लॉगिन",
      noNotifications: "कोई सूचना नहीं",
      clearAll: "सभी हटाएं",
      department: "विभाग",
      subDepartment: "उप-विभाग",
      notifications: "सूचनाएं",
      upcomingHearing: "आगामी सुनवाई",
      departmentReport: "विभागीय रिपोर्ट",
      contemptCases: "अवमानना मामले"
    }
  };

  const t = translations[currentLang];

  const handleNotificationClick = (notification: any) => {
    if (notification.caseId) {
      // Use _id if available, else caseId
      navigate(`/notification-case/${notification._id || notification.caseId}`);
      markAsRead(notification.id);
    }
  };

  return (
    <header className="top-0 left-0 w-full z-50 bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-4">
            <img
              src="/logo.jpg"
              alt="Uttar Pradesh logo"
              style={{ borderRadius: '40px ' }}
              className="h-16 w-auto md:h-20"
            />
            <h1 className="text-lg md:text-2xl font-bold whitespace-nowrap">{t.title}</h1>
          </div>
          <button
            className="md:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <nav
          className={`flex-col md:flex-row md:flex md:items-center md:space-x-4 mt-4 md:mt-0 ${mobileMenuOpen ? 'flex' : 'hidden'} md:!flex`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 text-sm md:text-base">
            <li>
              <Link to="/dashboard" className="hover:text-jansunwayi-gray transition-colors">
                {t.home}
              </Link>
            </li>
            <li>
              <Link to="/sub-departments" className="hover:text-jansunwayi-gray transition-colors">
                {t.subDepartments}
              </Link>
            </li>
            <li className="relative group">
              <button className="hover:text-jansunwayi-gray transition-colors focus:outline-none">
                {t.reports}
              </button>
              <ul className="absolute left-0 mt-2 w-48 bg-white text-jansunwayi-blue rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
                <li>
                  <Link to="/reports" className="block px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors">
                    {t.departmentReport}
                  </Link>
                </li>
                <li>
                  <Link to="/contempt-cases" className="block px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors">
                    {t.contemptCases}
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/" className="hover:text-jansunwayi-gray transition-colors">
                {t.logout}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {/* Notification Bell & Language Toggle */}
          <div className="relative">
            {isLoggedIn && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-jansunwayi-navy">
                    <Bell />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-jansunwayi-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-gray-900">
                      {t.notifications}
                    </h3>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-sm text-gray-500 hover:text-gray-900"
                      >
                        {t.clearAll}
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {t.noNotifications}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                          // Remove onClick to avoid accidental navigation on row click
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-sm text-blue-600">
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              {/* Show case name and case number if available */}
                              {(() => {
                                const caseName = notification.name || notification.caseName || notification.title;
                                if (!caseName) return null;
                                const caseUrl = `/notification-case/${notification.caseId}`;
                                return (
                                  <div className="text-xs text-gray-500 mb-1">
                                    <span className="font-medium">Case Name:</span>{' '}
                                    <a
                                      href={caseUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                                    >
                                      {caseName}
                                    </a>
                                  </div>
                                );
                              })()}
                              {notification.caseNumber && (
                                <div className="text-xs text-gray-500 mb-1">
                                  <span className="font-medium">Case Number:</span> {notification.caseNumber}
                                </div>
                              )}
                              {notification.departmentName && (
                                <div className="text-xs text-gray-500 mb-1">
                                  <span className="font-medium">{t.department}:</span> {notification.departmentName}
                                </div>
                              )}
                              {notification.subDepartmentName && (
                                <div className="text-xs text-gray-500 mb-1">
                                  <span className="font-medium">{t.subDepartment}:</span> {notification.subDepartmentName}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                {format(notification.date, 'dd/MM/yyyy')}
                              </div>
                            </div>
                            {/* Open details in a new tab */}
                            <div className="ml-4">
                              <NotificationViewDetailButton caseId={notification.caseId}>
                                View Details
                              </NotificationViewDetailButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="language-toggle border rounded-md overflow-hidden ml-2">
            <button
              className={`px-2 py-1 ${currentLang === 'en' ? 'bg-white text-jansunwayi-blue' : 'bg-transparent text-white'}`}
              onClick={currentLang === 'hi' ? toggleLanguage : undefined}
            >
              English
            </button>
            <button
              className={`px-2 py-1 ${currentLang === 'hi' ? 'bg-white text-jansunwayi-blue' : 'bg-transparent text-white'}`}
              onClick={currentLang === 'en' ? toggleLanguage : undefined}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
