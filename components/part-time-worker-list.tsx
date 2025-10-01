"use client"

import { useState } from "react"
import type { Employee, Schedule, Branch, Shift } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Calendar, Mail, Phone, Edit, CalendarPlus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface PartTimeWorkerListProps {
  workers: Employee[]
  weekendSchedules: Schedule[]
  branches: Branch[]
  shifts: Shift[]
  stats: {
    total: number
    monthSchedules: number
  }
}

export function PartTimeWorkerList({ workers, weekendSchedules, branches, shifts, stats }: PartTimeWorkerListProps) {
  const [branchFilter, setBranchFilter] = useState<string>("all")

  const filteredWorkers = workers.filter((worker) => {
    return branchFilter === "all" || worker.branch_id === branchFilter
  })

  // Group weekend schedules by date
  const schedulesByDate = weekendSchedules.reduce(
    (acc, schedule) => {
      if (!acc[schedule.schedule_date]) {
        acc[schedule.schedule_date] = []
      }
      acc[schedule.schedule_date].push(schedule)
      return acc
    },
    {} as Record<string, Schedule[]>,
  )

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Part-Time</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jadwal Bulan Ini</p>
                <p className="text-3xl font-bold text-blue-600">{stats.monthSchedules}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekend Mendatang</p>
                <p className="text-3xl font-bold text-orange-600">{weekendSchedules.length}</p>
              </div>
              <CalendarPlus className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekend Schedule Preview */}
      {Object.keys(schedulesByDate).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Weekend Mendatang</CardTitle>
            <CardDescription>Preview jadwal untuk weekend berikutnya</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(schedulesByDate).map(([date, schedules]) => (
                <div key={date} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">
                    {format(new Date(date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                        <div className="font-medium text-purple-900">{schedule.employees?.full_name}</div>
                        <div className="text-purple-700 text-xs mt-1">
                          {schedule.shifts?.name} - {schedule.branches?.name}
                        </div>
                        {schedule.employees?.employment_type === "part_time" && (
                          <Badge variant="secondary" className="text-xs mt-2">
                            Part-Time
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan Part-Time</CardTitle>
          <CardDescription>Filter dan kelola karyawan part-time</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Cabang" />
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
        </CardContent>
      </Card>

      {/* Worker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-lg transition-shadow border-purple-100">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{worker.full_name}</CardTitle>
                  <CardDescription className="mt-1">{worker.roles?.name || "No Role"}</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Part-Time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="font-normal">
                    {worker.branches?.name || "No Branch"}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {worker.teams?.name || "No Team"}
                  </Badge>
                </div>

                {worker.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                )}

                {worker.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{worker.phone}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/employees/${worker.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href="/schedules/new" className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Jadwal
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada karyawan part-time yang ditemukan</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
