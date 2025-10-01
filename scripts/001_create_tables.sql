-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teams/divisions table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job tasks table
CREATE TABLE IF NOT EXISTS job_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_job_tasks junction table (many-to-many)
CREATE TABLE IF NOT EXISTS employee_job_tasks (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  job_task_id UUID REFERENCES job_tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, job_task_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, schedule_date, shift_id)
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_branch ON employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_team ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedules_employee ON schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_date ON leave_requests(leave_date);
