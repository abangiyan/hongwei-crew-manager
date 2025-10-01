"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import type { Schedule, Employee, Shift, Branch } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ScheduleCalendarProps {
  schedules: Schedule[]
  employees: Employee[]
  shifts: Shift[]
  branches: Branch[]
}

export function ScheduleCalendar({ schedules, employees, shifts, branches }: ScheduleCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    return start
  })
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const router = useRouter()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    setCurrentWeekStart(start)
  }

  const getSchedulesForDateAndShift = (date: Date, shiftId: string) => {
    const dateStr = date.toISOString().split("T")[0]
    return schedules.filter((schedule) => {
      const matchesDate = schedule.schedule_date === dateStr
      const matchesShift = schedule.shift_id === shiftId
      const matchesBranch = branchFilter === "all" || schedule.branch_id === branchFilter
      return matchesDate && matchesShift && matchesBranch
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return

    const supabase = createClient()
    const { error } = await supabase.from("schedules").delete().eq("id", id)

    if (error) {
      alert("Gagal menghapus jadwal: " + error.message)
    } else {
      router.refresh()
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("id-ID", { weekday: "short" })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isWeekday = (date: Date) => {
    const day = date.getDay()
    return day >= 1 && day <= 5
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToCurrentWeek}>
                Minggu Ini
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter Cabang:</span>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="space-y-8">
        {shifts.map((shift) => (
          <Card key={shift.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-base font-semibold">
                  {shift.name}
                </Badge>
                <span className="text-sm text-muted-foreground font-normal">
                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)} WIB
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date, index) => {
                  const daySchedules = getSchedulesForDateAndShift(date, shift.id)
                  const isWeekdayDate = isWeekday(date)

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 min-h-[120px] ${
                        isToday(date) ? "bg-blue-50 border-blue-300" : "bg-white"
                      } ${!isWeekdayDate ? "bg-amber-50" : ""}`}
                    >
                      <div className="text-center mb-2">
                        <div className="text-xs text-muted-foreground">{getDayName(date)}</div>
                        <div className={`text-sm font-semibold ${isToday(date) ? "text-blue-600" : ""}`}>
                          {formatDate(date)}
                        </div>
                        {!isWeekdayDate && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Weekend
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {daySchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-orange-100 border border-orange-200 rounded p-2 text-xs group relative"
                          >
                            <div className="font-medium text-orange-900 truncate">{schedule.employees?.full_name}</div>
                            <div className="text-orange-700 text-[10px]">{schedule.branches?.name}</div>
                            {schedule.employees?.employment_type === "part_time" && (
                              <Badge variant="secondary" className="text-[10px] mt-1">
                                PT
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
