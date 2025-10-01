import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Utensils, UserCircle } from "lucide-react"

export default async function BranchesPage() {
  const supabase = await createClient()

  // Fetch branches with employee counts
  const { data: branches } = await supabase.from("branches").select("*").order("name")

  // Fetch teams with role counts
  const { data: teams } = await supabase.from("teams").select("*, roles(id, name)").order("name")

  // Get employee counts per branch
  const branchStats = await Promise.all(
    (branches || []).map(async (branch) => {
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", branch.id)
        .eq("status", "active")

      return { ...branch, employeeCount: count || 0 }
    }),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-orange-900">Cabang & Tim</h1>
          <p className="text-muted-foreground mt-1">Kelola cabang restoran dan tim kerja</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Branches Section */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Cabang Restoran
            </h2>

            <div className="space-y-4">
              {branchStats.map((branch) => (
                <Card key={branch.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{branch.name}</CardTitle>
                        {branch.address && <CardDescription className="mt-1">{branch.address}</CardDescription>}
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {branch.employeeCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{branch.employeeCount} karyawan aktif</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Teams Section */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              Tim & Divisi
            </h2>

            <div className="space-y-4">
              {teams?.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {team.name === "Kitchen" ? (
                            <Utensils className="h-5 w-5 text-orange-600" />
                          ) : (
                            <Users className="h-5 w-5 text-blue-600" />
                          )}
                          {team.name}
                        </CardTitle>
                        {team.description && <CardDescription className="mt-1">{team.description}</CardDescription>}
                      </div>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {team.roles?.length || 0} roles
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Roles dalam tim ini:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.roles?.map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
