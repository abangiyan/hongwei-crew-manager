"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Employee, Shift, Branch } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScheduleFormProps {
  employees: Employee[]
  shifts: Shift[]
  branches: Branch[]
}

export function ScheduleForm({ employees, shifts, branches }: ScheduleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    employee_id: "",
    shift_id: "",
    branch_id: "",
    notes: "",
  })
  const [error, setError] = useState<string>("")

  const selectedEmployee = employees.find((e) => e.id === formData.employee_id)

  const isWeekend = date ? date.getDay() === 0 || date.getDay() === 6 : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!date) {
      setError("Silakan pilih tanggal")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Check if employee already has a schedule on this date
      const { data: existingSchedule } = await supabase
        .from("schedules")
        .select("*")
        .eq("employee_id", formData.employee_id)
        .eq("schedule_date", format(date, "yyyy-MM-dd"))
        .single()

      if (existingSchedule) {
        setError("Karyawan sudah memiliki jadwal pada tanggal ini")
        setIsLoading(false)
        return
      }

      // Check if it's a weekday for full-time employees (they can't take leave on weekends)
      const isWeekday = date.getDay() >= 1 && date.getDay() <= 5

      if (!isWeekday && selectedEmployee?.employment_type === "full_time") {
        // Weekend - only part-time or external workers should be scheduled
        const confirmWeekend = confirm(
          "Ini adalah hari weekend. Karyawan full-time biasanya libur. Apakah Anda yakin ingin menjadwalkan karyawan ini?",
        )
        if (!confirmWeekend) {
          setIsLoading(false)
          return
        }
      }

      const { error: insertError } = await supabase.from("schedules").insert({
        ...formData,
        schedule_date: format(date, "yyyy-MM-dd"),
      })

      if (insertError) throw insertError

      router.push("/schedules")
      router.refresh()
    } catch (error: any) {
      setError("Error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Jadwal</CardTitle>
          <CardDescription>Pilih karyawan, tanggal, dan shift untuk dijadwalkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="employee_id">Karyawan *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Karyawan" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name} - {employee.roles?.name} ({employee.branches?.name}) -{" "}
                    {employee.employment_type === "full_time" ? "Full Time" : "Part Time"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tanggal *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: localeId }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            {isWeekend && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ini adalah hari weekend. Biasanya untuk karyawan part-time atau external.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shift_id">Shift *</Label>
              <Select
                value={formData.shift_id}
                onValueChange={(value) => setFormData({ ...formData, shift_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="branch_id">Cabang *</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                required
              >
                <SelectTrigger>
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
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Menyimpan..." : "Tambah Jadwal"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
