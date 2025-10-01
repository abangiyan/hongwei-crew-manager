-- Add job_task_id to schedules table to track specific job assignment for each schedule
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS job_task_id UUID REFERENCES job_tasks(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_schedules_job_task ON schedules(job_task_id);

-- Add is_overtime flag to track overtime shifts
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS is_overtime BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN schedules.job_task_id IS 'Specific job task assigned for this schedule (mainly for Frontline team)';
COMMENT ON COLUMN schedules.is_overtime IS 'Indicates if this is an overtime shift (employee working multiple shifts same day)';
