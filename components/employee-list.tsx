"use client"

import { useState } from "react"
import type { Employee, Branch, Team, Role, JobTask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, ChefHat, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AddEmployeeModal } from "./add-employee-modal"
import { useToast } from "@/hooks/use-toast"

interface EmployeeListProps {
  employees: Employee[]
  branches: Branch[]
  teams: Team[]
  roles: Role[]
  jobTasks: JobTask[]
}

export function EmployeeList({ employees, branches, teams, roles, jobTasks }: EmployeeListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const employeesByTeam = teams.reduce(
    (acc, team) => {
      acc[team.id] = employees.filter((emp) => emp.team_id === team.id)
      return acc
    },
    {} as Record<string, Employee[]>,
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) return

    const supabase = createClient()
    const { error } = await supabase.from("employees").delete().eq("id", id)

    if (error) {
      toast({
        title: "Gagal!",
        description: "Gagal menghapus karyawan: " + error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Berhasil!",
        description: `${name} berhasil dihapus.`,
        className: "bg-green-50 border-green-500",
      })
      router.refresh()
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      {teams.map((team) => {
        const teamEmployees = employeesByTeam[team.id] || []
        if (teamEmployees.length === 0) return null

        return (
          <div key={team.id} className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/20">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {team.name === "Kitchen" ? (
                  <ChefHat className="h-5 w-5 text-primary" />
                ) : (
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{team.name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{teamEmployees.length} karyawan</p>
              </div>
            </div>

            <div className="bg-card rounded-lg border overflow-hidden">
              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nama</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Posisi</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Cabang</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {teamEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{employee.full_name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-muted-foreground">{employee.roles?.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {employee.branches?.name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={employee.employment_type === "full_time" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {employee.employment_type === "full_time" ? "Full Time" : "Part Time"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/employees/${employee.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee.id, employee.full_name)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list view */}
              <div className="sm:hidden divide-y">
                {teamEmployees.map((employee) => (
                  <div key={employee.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">{employee.roles?.name}</p>
                      </div>
                      <Badge
                        variant={employee.employment_type === "full_time" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {employee.employment_type === "full_time" ? "FT" : "PT"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {employee.branches?.name}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Link href={`/employees/${employee.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id, employee.full_name)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {employees.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">Belum ada karyawan. Klik tombol "Tambah Karyawan" untuk memulai.</p>
        </div>
      )}

      <AddEmployeeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        branches={branches}
        teams={teams}
        roles={roles}
        jobTasks={jobTasks}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
