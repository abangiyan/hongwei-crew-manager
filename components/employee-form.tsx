"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Branch, Team, Role, JobTask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface EmployeeFormProps {
  branches: Branch[]
  teams: Team[]
  roles: Role[]
  jobTasks: JobTask[]
  employee?: any
  existingJobTasks?: string[]
}

export function EmployeeForm({ branches, teams, roles, jobTasks, employee, existingJobTasks = [] }: EmployeeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    branch_id: employee?.branch_id || "",
    team_id: employee?.team_id || "",
    role_id: employee?.role_id || "",
    employment_type: employee?.employment_type || "full_time",
    hire_date: employee?.hire_date || new Date().toISOString().split("T")[0],
  })
  const [selectedJobTasks, setSelectedJobTasks] = useState<string[]>(existingJobTasks)

  const filteredRoles = formData.team_id ? roles.filter((role) => role.team_id === formData.team_id) : roles

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      if (employee) {
        const { error } = await supabase.from("employees").update(formData).eq("id", employee.id)

        if (error) throw error

        await supabase.from("employee_job_tasks").delete().eq("employee_id", employee.id)

        if (selectedJobTasks.length > 0) {
          const jobTasksData = selectedJobTasks.map((taskId) => ({
            employee_id: employee.id,
            job_task_id: taskId,
          }))

          await supabase.from("employee_job_tasks").insert(jobTasksData)
        }

        toast({
          title: "Berhasil!",
          description: `Data karyawan ${formData.full_name} berhasil diperbarui.`,
          className: "bg-green-50 border-green-200",
        })
      } else {
        const { data: newEmployee, error } = await supabase.from("employees").insert(formData).select().single()

        if (error) throw error

        if (selectedJobTasks.length > 0 && newEmployee) {
          const jobTasksData = selectedJobTasks.map((taskId) => ({
            employee_id: newEmployee.id,
            job_task_id: taskId,
          }))

          await supabase.from("employee_job_tasks").insert(jobTasksData)
        }

        toast({
          title: "Berhasil!",
          description: `Karyawan ${formData.full_name} berhasil ditambahkan.`,
          className: "bg-green-50 border-green-200",
        })
      }

      router.push("/employees")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Gagal!",
        description: error.message || "Terjadi kesalahan saat menyimpan data karyawan.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="text-2xl">Informasi Karyawan</CardTitle>
          <CardDescription>Lengkapi semua informasi yang diperlukan dengan benar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">Data Pribadi</h3>
            <div>
              <Label htmlFor="full_name" className="text-base">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                required
                placeholder="Masukkan nama lengkap"
                className="mt-1.5 h-11"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  className="mt-1.5 h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base">
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className="mt-1.5 h-11"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">Informasi Pekerjaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch_id" className="text-base">
                  Cabang <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                  required
                >
                  <SelectTrigger className="mt-1.5 h-11">
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
                <Label htmlFor="team_id" className="text-base">
                  Tim <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) => setFormData({ ...formData, team_id: value, role_id: "" })}
                  required
                >
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue placeholder="Pilih Tim" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role_id" className="text-base">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                  required
                  disabled={!formData.team_id}
                >
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue placeholder={formData.team_id ? "Pilih Role" : "Pilih Tim terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.team_id && <p className="text-xs text-muted-foreground mt-1.5">Pilih tim terlebih dahulu</p>}
              </div>

              <div>
                <Label htmlFor="employment_type" className="text-base">
                  Tipe Karyawan <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      employment_type: value as "full_time" | "part_time",
                    })
                  }
                  required
                >
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="hire_date" className="text-base">
                Tanggal Bergabung <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hire_date"
                type="date"
                required
                className="mt-1.5 h-11"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Tugas Pekerjaan</h3>
            <p className="text-sm text-muted-foreground mb-4">Pilih tugas-tugas yang akan dikerjakan</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={task.id}
                    checked={selectedJobTasks.includes(task.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedJobTasks([...selectedJobTasks, task.id])
                      } else {
                        setSelectedJobTasks(selectedJobTasks.filter((id) => id !== task.id))
                      }
                    }}
                  />
                  <label
                    htmlFor={task.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {task.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 font-semibold"
              size="lg"
            >
              {isLoading ? "Menyimpan..." : employee ? "Update Karyawan" : "Tambah Karyawan"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-8" size="lg">
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
