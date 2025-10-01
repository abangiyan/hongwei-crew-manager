"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Employee } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LeaveRequestFormProps {
  employees: Employee[]
}

export function LeaveRequestForm({ employees }: LeaveRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    employee_id: "",
    reason: "",
  })
  const [error, setError] = useState<string>("")

  const isWeekday = (date: Date) => {
    const day = date.getDay()
    return day >= 1 && day <= 5
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!date) {
      setError("Silakan pilih tanggal")
      setIsLoading(false)
      return
    }

    if (!isWeekday(date)) {
      setError("Cuti hanya bisa diambil pada hari weekdays (Senin-Jumat)")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Check if employee already has leave request this week
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

      const { data: existingLeaves } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("employee_id", formData.employee_id)
        .gte("leave_date", format(weekStart, "yyyy-MM-dd"))
        .lte("leave_date", format(weekEnd, "yyyy-MM-dd"))

      if (existingLeaves && existingLeaves.length > 0) {
        setError("Karyawan sudah memiliki permintaan cuti pada minggu ini (1x per minggu)")
        setIsLoading(false)
        return
      }

      // Check if employee already has a schedule on this date
      const { data: existingSchedule } = await supabase
        .from("schedules")
        .select("*")
        .eq("employee_id", formData.employee_id)
        .eq("schedule_date", format(date, "yyyy-MM-dd"))

      if (existingSchedule && existingSchedule.length > 0) {
        const confirmOverride = confirm(
          "Karyawan sudah memiliki jadwal pada tanggal ini. Apakah Anda yakin ingin mengajukan cuti?",
        )
        if (!confirmOverride) {
          setIsLoading(false)
          return
        }
      }

      const { error: insertError } = await supabase.from("leave_requests").insert({
        ...formData,
        leave_date: format(date, "yyyy-MM-dd"),
      })

      if (insertError) throw insertError

      router.push("/leaves")
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
          <CardTitle>Informasi Cuti</CardTitle>
          <CardDescription>Pilih karyawan dan tanggal untuk permintaan cuti</CardDescription>
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
                    {employee.full_name} - {employee.roles?.name} ({employee.branches?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tanggal Cuti *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: localeId }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const day = date.getDay()
                    return day === 0 || day === 6 // Disable weekends
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-2">
              Cuti hanya bisa diambil pada hari weekdays (Senin-Jumat), maksimal 1x per minggu
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Alasan Cuti</Label>
            <Textarea
              id="reason"
              placeholder="Masukkan alasan cuti (opsional)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Mengajukan..." : "Ajukan Cuti"}
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
