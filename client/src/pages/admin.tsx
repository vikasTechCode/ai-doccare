import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription, } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Activity, 
  FileText, 
  Settings, 
  Plus, 
  AlertCircle, 
  Eye,
  UserCheck,
  TrendingUp,
  Heart,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] =
  useState<any>(null);
  const queryClient = useQueryClient();
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [articleFormData, setArticleFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    readTime: "",
    imageUrl: "",
  });

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetch("/api/admin/stats").then(res => res.json()),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => fetch("/api/admin/users").then(res => res.json()),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: () => fetch("/api/articles").then(res => res.json()),
  });

    const { data: adminAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/admin/appointments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/appointments");

      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }

      return response.json();
    },
  });

  
  

  const addArticleMutation = useMutation({
  mutationFn: async (articleData: any) => {
    const url = selectedArticleId
      ? `/api/articles/${selectedArticleId}`
      : "/api/articles";

    const method = selectedArticleId ? "PUT" : "POST";

    const response = await apiRequest(method, url, articleData);
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    setIsAddingArticle(false);
    setSelectedArticleId(null);
    setArticleFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      author: "",
      readTime: "",
      imageUrl: "",
    });
  },
});
const deleteArticleMutation = useMutation({
  mutationFn: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/articles/${id}`);
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
  },
});

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addArticleMutation.mutate(articleFormData);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "patient":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage users, content, and system settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {adminStats?.totalUsers || 0}
                  </p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Sessions</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {adminStats?.activeSessions || 0}
                  </p>
                  <p className="text-sm text-slate-500">Currently online</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Articles</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {adminStats?.totalArticles || 0}
                  </p>
                  <p className="text-sm text-blue-600">+3 this week</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">System Health</p>
                  <p className="text-2xl font-bold text-green-600">
                    {adminStats?.systemStatus || "Healthy"}
                  </p>
                  <p className="text-sm text-slate-500">All systems operational</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="articles">Content Management</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            
          </TabsList>
          
          
          <TabsContent value="appointments">
  <Card>
    <CardHeader>
      <CardTitle>Appointment Management</CardTitle>
    </CardHeader>

    <CardContent>
      {appointmentsLoading ? (
        <p className="text-sm text-slate-500">
          Loading appointments...
        </p>
      ) : adminAppointments.length === 0 ? (
        <p className="text-sm text-slate-500">
          No appointments found.
        </p>
      ) : (
        <div className="space-y-4">
          {adminAppointments.map((appointment: any) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => setSelectedAppointment(appointment)}
              className="w-full rounded-lg border border-slate-200 p-4 text-left
                         transition-colors hover:bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {appointment.patientName || "Unknown patient"}
                  </p>

                  <p className="text-sm text-slate-600">
                    Doctor: {appointment.doctorName || "Unknown doctor"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {appointment.appointmentDate
                      ? new Date(
                          appointment.appointmentDate
                        ).toLocaleString()
                      : "Date not available"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Type: {appointment.appointmentType || "Not specified"}
                  </p>
                </div>

                <Badge
                  className={
                    ["confirmed", "approved"].includes(
                      String(appointment.status ?? "").toLowerCase()
                    )
                      ? "bg-green-100 text-green-800"
                      : ["rejected", "cancelled"].includes(
                          String(appointment.status ?? "").toLowerCase()
                        )
                      ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                  }
                >
                  {String(appointment.status ?? "unknown").toLowerCase() ===
                  "scheduled"
                    ? "Pending"
                    : String(appointment.status ?? "Unknown")
                        .charAt(0)
                        .toUpperCase() +
                      String(appointment.status ?? "Unknown").slice(1)}
                </Badge>
              </div>

              <p className="mt-2 text-xs text-blue-600">
                Click to view details
              </p>
            </button>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="text-blue-600 h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          <p className="text-sm text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Button
  variant="outline"
  size="sm"
  onClick={() => setSelectedUser(user)}
>
  <Eye className="mr-2 h-4 w-4" />
  View
</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Management</CardTitle>
                  <Dialog
  open={isAddingArticle}
  onOpenChange={(open) => {
    setIsAddingArticle(open);
    if (!open) setSelectedArticleId(null);
  }}
>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Article
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Article</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleArticleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={articleFormData.title}
                            onChange={(e) => setArticleFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Article title"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              onValueChange={(value) => setArticleFormData(prev => ({ ...prev, category: value }))}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Preventive Care">Preventive Care</SelectItem>
                                <SelectItem value="Nutrition">Nutrition</SelectItem>
                                <SelectItem value="Fitness">Fitness</SelectItem>
                                <SelectItem value="Mental Health">Mental Health</SelectItem>
                                <SelectItem value="Women's Health">Women's Health</SelectItem>
                                <SelectItem value="Men's Health">Men's Health</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="readTime">Read Time</Label>
                            <Input
                              id="readTime"
                              value={articleFormData.readTime}
                              onChange={(e) => setArticleFormData(prev => ({ ...prev, readTime: e.target.value }))}
                              placeholder="e.g., 5 min read"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="author">Author</Label>
                          <Input
                            id="author"
                            value={articleFormData.author}
                            onChange={(e) => setArticleFormData(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="Author name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            value={articleFormData.imageUrl}
                            onChange={(e) => setArticleFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="excerpt">Excerpt</Label>
                          <Textarea
                            id="excerpt"
                            value={articleFormData.excerpt}
                            onChange={(e) => setArticleFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                            placeholder="Brief summary of the article"
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={articleFormData.content}
                            onChange={(e) => setArticleFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Full article content"
                            rows={8}
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <Button type="button" variant="outline" onClick={() => setIsAddingArticle(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addArticleMutation.isPending}>
  {addArticleMutation.isPending
    ? "Saving..."
    : selectedArticleId
      ? "Save Changes"
      : "Publish Article"}
</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {addArticleMutation.isError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to add article. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  {articles.map((article: any) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium text-slate-900">{article.title}</h3>
                          <p className="text-sm text-slate-600">{article.category}</p>
                          <p className="text-sm text-slate-500">
                            By {article.author} • {article.readTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </Badge>
                        <Button
  variant="outline"
  size="sm"
  onClick={() => {
    setSelectedArticleId(article.id);
    setArticleFormData({
      title: article.title ?? "",
      excerpt: article.excerpt ?? "",
      content: article.content ?? "",
      category: article.category ?? "",
      author: article.author ?? "",
      readTime: article.readTime ?? "",
      imageUrl: article.imageUrl ?? "",
    });
    setIsAddingArticle(true);
  }}
>
  <Eye className="mr-2 h-4 w-4" />
  Edit
</Button>
<Button
  variant="destructive"
  size="sm"
  onClick={() => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(article.id);
    }
  }}
  disabled={deleteArticleMutation.isPending}
>
  Delete
</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">User Growth</h3>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">+24%</div>
                    <p className="text-sm text-slate-600">Compared to last month</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">AI Interactions</h3>
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">1,247</div>
                    <p className="text-sm text-slate-600">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">AI Features</h3>
                      <p className="text-sm text-slate-600">Enable AI-powered health assistant and symptom checker</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">User Registrations</h3>
                      <p className="text-sm text-slate-600">Allow new users to register for accounts</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">Data Backups</h3>
                      <p className="text-sm text-slate-600">Automatic daily backups of user data</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
                </Tabs>

        {/* User Details Dialog */}
        {/* Appointment Details Dialog */}
<Dialog
  open={!!selectedAppointment}
  onOpenChange={(open) => {
    if (!open) setSelectedAppointment(null);
  }}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Appointment Details</DialogTitle>
      <DialogDescription>
        Read-only information about this appointment.
      </DialogDescription>
    </DialogHeader>

    {selectedAppointment && (
      <div className="space-y-3">
        <p>
          <strong>Patient:</strong>{" "}
          {selectedAppointment.patientName || "Unknown patient"}
        </p>

        <p>
          <strong>Doctor:</strong>{" "}
          {selectedAppointment.doctorName || "Unknown doctor"}
        </p>

        <p>
          <strong>Date and Time:</strong>{" "}
          {selectedAppointment.appointmentDate
            ? new Date(
                selectedAppointment.appointmentDate
              ).toLocaleString()
            : "Not available"}
        </p>

        <p>
          <strong>Appointment Type:</strong>{" "}
          {selectedAppointment.appointmentType || "Not specified"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {String(selectedAppointment.status ?? "Unknown")
            .toLowerCase() === "scheduled"
            ? "Pending"
            : String(selectedAppointment.status ?? "Unknown")
                .charAt(0)
                .toUpperCase() +
              String(selectedAppointment.status ?? "Unknown").slice(1)}
        </p>

        <p>
          <strong>Notes:</strong>{" "}
          {selectedAppointment.notes || "No notes provided"}
        </p>
      </div>
    )}
  </DialogContent>
</Dialog>
        <Dialog
          open={!!selectedUser}
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
  {selectedArticleId ? "Edit Article" : "Add New Article"}
</DialogTitle>
              <DialogDescription>
                Profile information for the selected user.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-3">
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p>
                  <strong>Username:</strong> {selectedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedUser.phone || "Not provided"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedUser.address || "Not provided"}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {selectedUser.dateOfBirth || "Not provided"}
                </p>
                <p>
                  <strong>Gender:</strong>{" "}
                  {selectedUser.gender || "Not provided"}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
