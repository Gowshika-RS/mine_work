export const toWorkerRows = (users = []) => {
  return users
    .filter((user) => user.role === 'worker')
    .map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.profile?.full_name || user.username,
      email: user.email,
      department: user.profile?.department || 'N/A',
      location: user.profile?.mine_location || 'N/A',
      status: user.is_active ? 'active' : 'inactive',
      safetyScore: Number(user.profile?.safety_score ?? 0),
      employeeId: user.profile?.employee_id || 'N/A',
      profile: user.profile,
    }));
};

export const buildDashboardCards = (summary = {}, workers = []) => {
  const activeWorkers = workers.filter((worker) => worker.status === 'active').length;
  const totalWorkers = workers.length;

  return [
    {
      title: 'Total Workers',
      value: totalWorkers,
      detail: `${activeWorkers} currently active`,
      tone: 'primary',
    },
    {
      title: 'Avg Safety Score',
      value: `${Number(summary.average_safety_score ?? 0).toFixed(1)}%`,
      detail: 'Current team performance',
      tone: 'success',
    },
    {
      title: 'Incidents This Week',
      value: summary.incidents_this_week ?? 0,
      detail: `${summary.unresolved_incidents ?? 0} unresolved`,
      tone: 'warning',
    },
    {
      title: 'Avg Shift Hours',
      value: `${Number(summary.average_hours_today ?? 0).toFixed(1)}h`,
      detail: 'Today’s operating load',
      tone: 'info',
    },
  ];
};
