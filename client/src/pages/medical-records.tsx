import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, Eye, FileText, X as XRay, Pill, Plus, AlertCircle } from "lucide-react";

export default function MedicalRecords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    recordType: "",
    filePath: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

const { data: records = [], isLoading, error } = useQuery({
  queryKey: ["/api/medical-records", user?.id],
  enabled: !!user?.id,
  queryFn: async () => {
    const response = await fetch(`/api/medical-records/${user!.id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch medical records");
    }

    return response.json();
  },
});



 
const addRecordMutation = useMutation({
  mutationFn: async (recordData: any) => {
    const formDataToSend = new FormData();

    formDataToSend.append("title", recordData.title);
    formDataToSend.append("description", recordData.description);
    formDataToSend.append("recordType", recordData.recordType);
    formDataToSend.append("userId", String(user?.id));

    if (selectedFile) {
      formDataToSend.append("file", selectedFile);
    }

    const response = await fetch("/api/medical-records", {
      method: "POST",
      credentials: "include",
      body: formDataToSend,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to add medical record");
    }

    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/medical-records", user?.id],
    });
    setIsAddingRecord(false);
    setFormData({
      title: "",
      description: "",
      recordType: "",
      filePath: "",
    });
    setSelectedFile(null);
  },
});


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecordMutation.mutate(formData);
  };

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'x_ray':
        return <XRay className="text-blue-600 h-5 w-5" />;
      case 'prescription':
        return <Pill className="text-green-600 h-5 w-5" />;
      case 'lab_result':
        return <FileText className="text-red-600 h-5 w-5" />;
      default:
        return <FileText className="text-slate-600 h-5 w-5" />;
    }
  };

  const getRecordTypeLabel = (recordType: string) => {
    switch (recordType) {
      case 'x_ray':
        return 'X-Ray';
      case 'prescription':
        return 'Pill';
      case 'lab_result':
        return 'Lab Result';
      case 'report':
        return 'Medical Report';
      default:
        return 'Medical Record';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Records</h1>
            <p className="text-slate-600">Manage and view your medical documents</p>
          </div>
          
          <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Blood Test Results"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recordType">Record Type</Label>
                  <Select
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recordType: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab_result">Lab Result</SelectItem>
                      <SelectItem value="x_ray">X-Ray</SelectItem>
                      <SelectItem value="prescription">Pill</SelectItem>
                      <SelectItem value="report">Medical Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional notes or description"
                    rows={3}
                  />
                </div>
                
                
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File (PDF, JPG, PNG — max 10 MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                    setSelectedFile(file);
                  }}
                />
                {selectedFile && (
                  <p className="text-sm text-slate-600">
                   Selected: {selectedFile.name}
                  </p>
                   )}
                </div>

                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddingRecord(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addRecordMutation.isPending}>
                    {addRecordMutation.isPending ? "Adding..." : "Add Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addRecordMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to add medical record. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Records Grid */}
        {records.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Medical Records</h3>
              <p className="text-slate-600 mb-6">Upload your first medical record to get started</p>
              <Button onClick={() => setIsAddingRecord(true)} className="bg-green-600 hover:bg-green-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record: any) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getRecordIcon(record.recordType)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <p className="text-sm text-slate-600">{getRecordTypeLabel(record.recordType)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {record.description && (
                    <p className="text-sm text-slate-600 mb-4">{record.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span>Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
    disabled={!record.filePath}
    onClick={() => {
      if (record.filePath) {
        window.open(
          `${record.filePath}?userId=${user?.id}`,
          "_blank"
        );
      }
    }}
  >
    <Eye className="mr-2 h-4 w-4" />
    View
  </Button>

  <Button
    variant="outline"
    size="sm"
    className="flex-1"
    disabled={!record.filePath}
    onClick={() => {
      if (record.filePath) {
        window.open(
          `${record.filePath}?userId=${user?.id}&download=1`,
          "_blank"
        );
      }
    }}
  >
    <Download className="mr-2 h-4 w-4" />
    Download
  </Button>
</div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
