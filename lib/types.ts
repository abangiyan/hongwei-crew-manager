export interface Branch {
  id: string
  name: string
  address: string | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Role {
  id: string
  name: string
  team_id: string | null
  created_at: string
  teams?: Team
}

export interface JobTask {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Employee {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  branch_id: string | null
  team_id: string | null
  role_id: string | null
  employment_type: "full_time" | "part_time"
  status: "active" | "inactive"
  hire_date: string
  created_at: string
  updated_at: string
  branches?: Branch
  teams?: Team
  roles?: Role
}

export interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  created_at: string
}

export interface Schedule {
  id: string
  employee_id: string
  shift_id: string
  branch_id: string
  schedule_date: string
  status: "scheduled" | "completed" | "cancelled"
  notes: string | null
  job_task_id: string | null
  is_overtime: boolean
  created_at: string
  updated_at: string
  employees?: Employee
  shifts?: Shift
  branches?: Branch
  job_tasks?: JobTask
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_date: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  employees?: Employee
}
