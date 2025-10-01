-- Enable Row Level Security on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for now, we'll allow all operations)
-- In production, you would want to restrict these based on user roles

-- Branches policies
CREATE POLICY "Allow all operations on branches" ON branches FOR ALL USING (true) WITH CHECK (true);

-- Teams policies
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);

-- Roles policies
CREATE POLICY "Allow all operations on roles" ON roles FOR ALL USING (true) WITH CHECK (true);

-- Job tasks policies
CREATE POLICY "Allow all operations on job_tasks" ON job_tasks FOR ALL USING (true) WITH CHECK (true);

-- Employees policies
CREATE POLICY "Allow all operations on employees" ON employees FOR ALL USING (true) WITH CHECK (true);

-- Employee job tasks policies
CREATE POLICY "Allow all operations on employee_job_tasks" ON employee_job_tasks FOR ALL USING (true) WITH CHECK (true);

-- Shifts policies
CREATE POLICY "Allow all operations on shifts" ON shifts FOR ALL USING (true) WITH CHECK (true);

-- Schedules policies
CREATE POLICY "Allow all operations on schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);

-- Leave requests policies
CREATE POLICY "Allow all operations on leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
