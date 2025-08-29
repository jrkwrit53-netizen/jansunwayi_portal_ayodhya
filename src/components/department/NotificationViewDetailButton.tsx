import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationViewDetailButtonProps {
  caseId: string;
  children?: React.ReactNode;
}

const NotificationViewDetailButton: React.FC<NotificationViewDetailButtonProps> = ({ caseId, children }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(`/case/${caseId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} as={undefined}>
      {children || 'View Details'}
    </Button>
  );
};

export default NotificationViewDetailButton; 