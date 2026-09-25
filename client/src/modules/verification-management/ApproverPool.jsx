import React from 'react';
import { OfficerDashboard } from './OfficerDashboard';

// Individual job pool page for Senior Approvers (admin-panel style).
export const ApproverPool = () => {
  return <OfficerDashboard mode="approver" />;
};

export default ApproverPool;