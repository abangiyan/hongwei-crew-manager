"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Employee, Shift, Branch, JobTask, Team } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, AlertCircle, Plus, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface CreateScheduleModalProps {
  employees: Employee[]
  shifts: Shift[]
  branches: Branch[]
  jobTasks: JobTask[]
  teams: Team[]
}

interface EmployeeAssignment {
  employeeId: string
  jobTaskIds: string[] // For Frontline employees
}

export function CreateScheduleModal({ employees, shifts, branches, jobTasks, teams }: CreateScheduleModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"branch" | "shift1" | "shift2">("branch")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Form data
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [shift1Assignments, setShift1Assignments] = useState<{
    frontline: EmployeeAssignment[]
    kitchen: string[] // Kitchen employees don't need job task assignments
  }>({ frontline: [], kitchen: [] })
  const [shift2Assignments, setShift2Assignments] = useState<{
    frontline: EmployeeAssignment[]
    kitchen: string[]
  }>({ frontline: [], kitchen: [] })

  // Get team IDs
  const frontlineTeam = teams.find((t) => t.name === "Frontline")
  const kitchenTeam = teams.find((t) => t.name === "Kitchen")

  // Filter employees by team
  const frontlineEmployees = employees.filter((e) => e.team_id === frontlineTeam?.id)
  const kitchenEmployees = employees.filter((e) => e.team_id === kitchenTeam?.id)

  // Get shifts
  const shift1 = shifts.find((s) => s.name === "Shift 1")
  const shift2 = shifts.find((s) => s.name === "Shift 2")

  // Check if employee is in Shift 1 (for overtime detection)
  const isEmployeeInShift1 = (employeeId: string) => {
    return (
      shift1Assignments.frontline.some((a) => a.employeeId === employeeId) ||
      shift1Assignments.kitchen.includes(employeeId)
    )
  }

  // Toggle Frontline employee in shift
  const toggleFrontlineEmployee = (shiftNum: 1 | 2, employeeId: string) => {
    const assignments = shiftNum === 1 ? shift1Assignments : shift2Assignments
    const setAssignments = shiftNum === 1 ? setShift1Assignments : setShift2Assignments

    const existingIndex = assignments.frontline.findIndex((a) => a.employeeId === employeeId)

    if (existingIndex >= 0) {
      // Remove employee
      setAssignments({
        ...assignments,
        frontline: assignments.frontline.filter((a) => a.employeeId !== employeeId),
      })
    } else {
      // Add employee
      setAssignments({
        ...assignments,
        frontline: [...assignments.frontline, { employeeId, jobTaskIds: [] }],
      })
    }
  }

  // Toggle job task for Frontline employee
  const toggleJobTask = (shiftNum: 1 | 2, employeeId: string, jobTaskId: string) => {
    const assignments = shiftNum === 1 ? shift1Assignments : shift2Assignments
    const setAssignments = shiftNum === 1 ? setShift1Assignments : setShift2Assignments

    const employeeAssignment = assignments.frontline.find((a) => a.employeeId === employeeId)
    if (!employeeAssignment) return

    const hasTask = employeeAssignment.jobTaskIds.includes(jobTaskId)

    setAssignments({
      ...assignments,
      frontline: assignments.frontline.map((a) =>
        a.employeeId === employeeId
          ? {
              ...a,
              jobTaskIds: hasTask ? a.jobTaskIds.filter((id) => id !== jobTaskId) : [...a.jobTaskIds, jobTaskId],
            }
          : a,
      ),
    })
  }

  // Toggle Kitchen employee in shift
  const toggleKitchenEmployee = (shiftNum: 1 | 2, employeeId: string) => {
    const assignments = shiftNum === 1 ? shift1Assignments : shift2Assignments
    const setAssignments = shiftNum === 1 ? setShift1Assignments : setShift2Assignments

    if (assignments.kitchen.includes(employeeId)) {
      setAssignments({
        ...assignments,
        kitchen: assignments.kitchen.filter((id) => id !== employeeId),
      })
    } else {
      setAssignments({
        ...assignments,
        kitchen: [...assignments.kitchen, employeeId],
      })
    }
  }

  const handleSubmit = async () => {
    if (!selectedBranch || !selectedDate || !shift1 || !shift2) {
      setError("Silakan lengkapi semua data yang diperlukan")
      return
    }

    setIsLoading(true)
    setError("")

    const supabase = createClient()

    try {
      const scheduleDate = format(selectedDate, "yyyy-MM-dd")
      const schedulesToInsert: any[] = []

      // Process Shift 1 assignments
      // Frontline employees with job tasks
      for (const assignment of shift1Assignments.frontline) {
        if (assignment.jobTaskIds.length === 0) {
          setError(`Karyawan Frontline harus memiliki minimal 1 job desk di Shift 1`)
          setIsLoading(false)
          return
        }

        // Create one schedule entry per job task
        for (const jobTaskId of assignment.jobTaskIds) {
          schedulesToInsert.push({
            employee_id: assignment.employeeId,
            shift_id: shift1.id,
            branch_id: selectedBranch,
            schedule_date: scheduleDate,
            job_task_id: jobTaskId,
            is_overtime: false,
            status: "scheduled",
          })
        }
      }

      // Kitchen employees (no job tasks)
      for (const employeeId of shift1Assignments.kitchen) {
        schedulesToInsert.push({
          employee_id: employeeId,
          shift_id: shift1.id,
          branch_id: selectedBranch,
          schedule_date: scheduleDate,
          job_task_id: null,
          is_overtime: false,
          status: "scheduled",
        })
      }

      // Process Shift 2 assignments
      // Frontline employees with job tasks
      for (const assignment of shift2Assignments.frontline) {
        const isOvertime = isEmployeeInShift1(assignment.employeeId)

        if (assignment.jobTaskIds.length === 0) {
          setError(`Karyawan Frontline harus memiliki minimal 1 job desk di Shift 2`)
          setIsLoading(false)
          return
        }

        for (const jobTaskId of assignment.jobTaskIds) {
          schedulesToInsert.push({
            employee_id: assignment.employeeId,
            shift_id: shift2.id,
            branch_id: selectedBranch,
            schedule_date: scheduleDate,
            job_task_id: jobTaskId,
            is_overtime: isOvertime,
            status: "scheduled",
          })
        }
      }

      // Kitchen employees (no job tasks for Shift 2)
      for (const employeeId of shift2Assignments.kitchen) {
        const isOvertime = isEmployeeInShift1(employeeId)

        schedulesToInsert.push({
          employee_id: employeeId,
          shift_id: shift2.id,
          branch_id: selectedBranch,
          schedule_date: scheduleDate,
          job_task_id: null,
          is_overtime: isOvertime,
          status: "scheduled",
        })
      }

      // Insert all schedules
      const { error: insertError } = await supabase.from("schedules").insert(schedulesToInsert)

      if (insertError) throw insertError

      // Reset and close
      setOpen(false)
      setStep("branch")
      setSelectedBranch("")
      setSelectedDate(undefined)
      setShift1Assignments({ frontline: [], kitchen: [] })
      setShift2Assignments({ frontline: [], kitchen: [] })

      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error creating schedules:", error)
      setError("Error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderBranchSelection = () => (
    <div className="space-y-4">
      <div>
        <Label>Pilih Cabang Toko *</Label>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Cabang" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tanggal Jadwal *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: localeId }) : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={() => setStep("shift1")} disabled={!selectedBranch || !selectedDate} className="w-full">
        Lanjut ke Shift 1
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )

  const renderShiftAssignment = (shiftNum: 1 | 2) => {
    const assignments = shiftNum === 1 ? shift1Assignments : shift2Assignments
    const shift = shiftNum === 1 ? shift1 : shift2

    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {shift?.name} ({shift?.start_time.slice(0, 5)} - {shift?.end_time.slice(0, 5)})
          </h3>
        </div>

        {/* Frontline Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tim Frontline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {frontlineEmployees.map((employee) => {
              const isSelected = assignments.frontline.some((a) => a.employeeId === employee.id)
              const assignment = assignments.frontline.find((a) => a.employeeId === employee.id)
              const isOvertime = shiftNum === 2 && isEmployeeInShift1(employee.id)

              return (
                <div key={employee.id} className="space-y-2 p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleFrontlineEmployee(shiftNum, employee.id)}
                    />
                    <Label className="flex-1 cursor-pointer">
                      {employee.full_name} - {employee.roles?.name}
                      {isOvertime && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Lembur</span>
                      )}
                    </Label>
                  </div>

                  {isSelected && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm text-muted-foreground">Job Desk:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {jobTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={assignment?.jobTaskIds.includes(task.id)}
                              onCheckedChange={() => toggleJobTask(shiftNum, employee.id, task.id)}
                            />
                            <Label className="text-sm cursor-pointer">{task.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Kitchen Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Tim Kitchen
              {shiftNum === 2 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">(Tidak perlu job desk)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {kitchenEmployees.map((employee) => {
              const isSelected = assignments.kitchen.includes(employee.id)
              const isOvertime = shiftNum === 2 && isEmployeeInShift1(employee.id)

              return (
                <div key={employee.id} className="flex items-center gap-2 p-2">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleKitchenEmployee(shiftNum, employee.id)} />
                  <Label className="flex-1 cursor-pointer">
                    {employee.full_name} - {employee.roles?.name}
                    {isOvertime && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Lembur</span>
                    )}
                  </Label>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {shiftNum === 1 ? (
            <>
              <Button variant="outline" onClick={() => setStep("branch")}>
                Kembali
              </Button>
              <Button onClick={() => setStep("shift2")} className="flex-1">
                Lanjut ke Shift 2
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("shift1")}>
                Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground h-11 px-6 font-semibold shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-5 w-5 mr-2" />
          Buat Jadwal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "branch" && "Buat Jadwal Baru"}
            {step === "shift1" && "Atur Shift 1"}
            {step === "shift2" && "Atur Shift 2"}
          </DialogTitle>
          <DialogDescription>
            {step === "branch" && "Pilih cabang dan tanggal untuk jadwal"}
            {step === "shift1" && "Pilih karyawan dan job desk untuk Shift 1"}
            {step === "shift2" && "Pilih karyawan dan job desk untuk Shift 2"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "branch" && renderBranchSelection()}
        {step === "shift1" && renderShiftAssignment(1)}
        {step === "shift2" && renderShiftAssignment(2)}
      </DialogContent>
    </Dialog>
  )
}
