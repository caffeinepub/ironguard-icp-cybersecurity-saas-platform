import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Download,
  FileText,
  Lock,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BillingStatus, ExternalBlob } from "../backend";
import type { FileMetadata } from "../backend";
import BillingAlert from "../components/BillingAlert";
import DashboardSidebar from "../components/DashboardSidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { DataTableRowSkeleton } from "../components/SkeletonLoader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteFileMetadata,
  useGetBusinessFiles,
  useGetCallerBusinessProfile,
  useGetCustomerBillingStatus,
  useSaveBusinessFileMetadata,
} from "../hooks/useQueries";

export default function DataManagerPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerBusinessProfile();
  const { data: billingStatus } = useGetCustomerBillingStatus();
  const businessId = identity?.getPrincipal().toString() || "";
  const { data: files = [], isLoading: filesLoading } =
    useGetBusinessFiles(businessId);
  const saveFile = useSaveBusinessFileMetadata();
  const deleteFile = useDeleteFileMetadata();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/auth" });
      return;
    }

    if (isFetched && !profile) {
      navigate({ to: "/onboarding" });
    }
  }, [identity, profile, isFetched, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !businessId) return;

    // Check if service is restricted
    if (billingStatus === BillingStatus.restricted) {
      toast.error(
        "Upload disabled: Service restricted due to payment issues. Please update your payment method.",
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          setUploadProgress(percentage);
        },
      );

      const fileMetadata: FileMetadata = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        blob,
        name: selectedFile.name,
        sizeBytes: BigInt(selectedFile.size),
        ownerBusinessId: businessId,
      };

      await saveFile.mutateAsync({ businessId, file: fileMetadata });

      toast.success("File uploaded successfully!");
      setSelectedFile(null);
      setUploadProgress(0);

      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.message?.includes("restricted")) {
        toast.error("Upload failed: Service restricted due to payment issues.");
      } else {
        toast.error("Failed to upload file. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: FileMetadata) => {
    try {
      const bytes = await file.blob.getBytes();
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (file: FileMetadata) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      await deleteFile.mutateAsync({ id: file.id, businessId });
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  if (!identity || profileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;

  const isRestricted = billingStatus === BillingStatus.restricted;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 flex">
        <DashboardSidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Billing Alert */}
            {billingStatus && <BillingAlert status={billingStatus} />}

            <div>
              <h1 className="text-3xl font-bold mb-2">Data Manager</h1>
              <p className="text-muted-foreground">
                Securely upload, manage, and download your encrypted files
              </p>
            </div>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Encrypted File</CardTitle>
                <CardDescription>
                  Files are encrypted client-side before upload. Only you can
                  decrypt them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRestricted && (
                  <Alert className="border-destructive bg-destructive/10">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription>
                      File uploads are disabled due to service restriction.
                      Please update your payment method to restore upload
                      functionality.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    disabled={isUploading || isRestricted}
                  />
                </div>

                {selectedFile && (
                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Lock className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || isRestricted}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
              </CardContent>
            </Card>

            {/* Files List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Files</CardTitle>
                <CardDescription>
                  All your encrypted files stored securely on ICP
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <DataTableRowSkeleton key={i} />
                    ))}
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No files uploaded yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload your first encrypted file to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(Number(file.sizeBytes) / 1024 / 1024).toFixed(
                                2,
                              )}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(file)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
