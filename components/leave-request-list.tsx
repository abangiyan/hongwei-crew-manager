"use client"

import { useState } from "react"
import type { LeaveRequest, Employee } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Calendar, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface LeaveRequestListProps {
  leaveRequests: LeaveRequest[]
  employees: Employee[]
}

export function LeaveRequestList({ leaveRequests, employees }: LeaveRequestListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  const filteredRequests = leaveRequests.filter((request) => {
    return statusFilter === "all" || request.status === statusFilter
  })

  const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected") => {
    const supabase = createClient()
    const { error } = await supabase.from("leave_requests").update({ status: newStatus }).eq("id", id)

    if (error) {
      alert("Gagal mengupdate status: " + error.message)
    } else {
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus permintaan cuti ini?")) return

    const supabase = createClient()
    const { error } = await supabase.from("leave_requests").delete().eq("id", id)

    if (error) {
      alert("Gagal menghapus permintaan: " + error.message)
    } else {
      router.refresh()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const pendingCount = leaveRequests.filter((r) => r.status === "pending").length
  const approvedCount = leaveRequests.filter((r) => r.status === "approved").length
  const rejectedCount = leaveRequests.filter((r) => r.status === "rejected").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Permintaan</CardTitle>
          <CardDescription>Filter berdasarkan status permintaan cuti</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{request.employees?.full_name}</CardTitle>
                  <CardDescription className="mt-1">
                    {request.employees?.roles?.name} - {request.employees?.branches?.name}
                  </CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(new Date(request.leave_date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                  </span>
                </div>

                {request.reason && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Alasan:</p>
                    <p className="text-xs">{request.reason}</p>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate(request.id, "approved")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Setuju
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                      onClick={() => handleStatusUpdate(request.id, "rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive bg-transparent"
                  onClick={() => handleDelete(request.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada permintaan cuti yang ditemukan</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
