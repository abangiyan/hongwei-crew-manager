"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Branch, Team, Role, JobTask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface AddEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: Branch[]
  teams: Team[]
  roles: Role[]
  jobTasks: JobTask[]
  onSuccess: () => void
}

export function AddEmployeeModal({
  open,
  onOpenChange,
  branches,
  teams,
  roles,
  jobTasks,
  onSuccess,
}: AddEmployeeModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    branch_id: "",
    team_id: "",
    role_id: "",
    employment_type: "full_time",
    hire_date: new Date().toISOString().split("T")[0],
  })
  const [selectedJobTasks, setSelectedJobTasks] = useState<string[]>([])

  const filteredRoles = formData.team_id ? roles.filter((role) => role.team_id === formData.team_id) : roles

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      branch_id: "",
      team_id: "",
      role_id: "",
      employment_type: "full_time",
      hire_date: new Date().toISOString().split("T")[0],
    })
    setSelectedJobTasks([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
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
        className: "bg-green-50 border-green-500",
      })

      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Gagal!",
        description: error.message || "Terjadi kesalahan saat menambahkan karyawan.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Tambah Karyawan Baru</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Lengkapi informasi karyawan yang akan ditambahkan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          {/* Data Pribadi */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">DATA PRIBADI</h3>
            <div>
              <Label htmlFor="full_name" className="text-xs sm:text-sm">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                required
                placeholder="Masukkan nama lengkap"
                className="mt-1.5 text-sm"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  className="mt-1.5 text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className="mt-1.5 text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Informasi Pekerjaan */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">INFORMASI PEKERJAAN</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="branch_id" className="text-xs sm:text-sm">
                  Cabang <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                  required
                >
                  <SelectTrigger className="mt-1.5 text-sm">
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id} className="text-sm">
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team_id" className="text-xs sm:text-sm">
                  Tim <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) => setFormData({ ...formData, team_id: value, role_id: "" })}
                  required
                >
                  <SelectTrigger className="mt-1.5 text-sm">
                    <SelectValue placeholder="Pilih Tim" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} className="text-sm">
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="role_id" className="text-xs sm:text-sm">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                  required
                  disabled={!formData.team_id}
                >
                  <SelectTrigger className="mt-1.5 text-sm">
                    <SelectValue placeholder={formData.team_id ? "Pilih Role" : "Pilih Tim dulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-sm">
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employment_type" className="text-xs sm:text-sm">
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
                  <SelectTrigger className="mt-1.5 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time" className="text-sm">
                      Full Time
                    </SelectItem>
                    <SelectItem value="part_time" className="text-sm">
                      Part Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="hire_date" className="text-xs sm:text-sm">
                Tanggal Bergabung <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hire_date"
                type="date"
                required
                className="mt-1.5 text-sm"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>
          </div>

          {/* Tugas Pekerjaan */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">TUGAS PEKERJAAN</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {jobTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-2">
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
                  <label htmlFor={task.id} className="text-xs sm:text-sm cursor-pointer">
                    {task.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 text-sm">
              {isLoading ? "Menyimpan..." : "Tambah Karyawan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
