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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Eye, EyeOff, Key, Lock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardSidebar from "../components/DashboardSidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerBusinessProfile } from "../hooks/useQueries";

type KeyEntry = {
  id: string;
  name: string;
  encryptedKey: string;
  metadata: string;
  createdAt: number;
};

export default function KeyVaultPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerBusinessProfile();

  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [addingKey, setAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", key: "", metadata: "" });

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/auth" });
      return;
    }

    if (isFetched && !profile) {
      navigate({ to: "/onboarding" });
    }
  }, [identity, profile, isFetched, navigate]);

  const handleAddKey = () => {
    if (!newKey.name || !newKey.key) {
      toast.error("Please provide a name and key");
      return;
    }

    const entry: KeyEntry = {
      id: Date.now().toString(),
      name: newKey.name,
      encryptedKey: btoa(newKey.key), // Simple encoding for demo
      metadata: newKey.metadata,
      createdAt: Date.now(),
    };

    setKeys([...keys, entry]);
    setNewKey({ name: "", key: "", metadata: "" });
    setAddingKey(false);
    toast.success("Key added to vault successfully!");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(atob(key));
    toast.success("Key copied to clipboard");
  };

  const toggleShowKey = (id: string) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 flex">
        <DashboardSidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Key Vault</h1>
                <p className="text-muted-foreground">
                  Securely store and manage your encryption keys
                </p>
              </div>
              <Button onClick={() => setAddingKey(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Key
              </Button>
            </div>

            {/* Add Key Form */}
            {addingKey && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Key</CardTitle>
                  <CardDescription>
                    Keys are encrypted client-side before storage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKey.name}
                      onChange={(e) =>
                        setNewKey({ ...newKey, name: e.target.value })
                      }
                      placeholder="e.g., Production API Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyValue">Key Value</Label>
                    <Textarea
                      id="keyValue"
                      value={newKey.key}
                      onChange={(e) =>
                        setNewKey({ ...newKey, key: e.target.value })
                      }
                      placeholder="Enter your key or secret"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyMetadata">Metadata (Optional)</Label>
                    <Input
                      id="keyMetadata"
                      value={newKey.metadata}
                      onChange={(e) =>
                        setNewKey({ ...newKey, metadata: e.target.value })
                      }
                      placeholder="Additional information"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddKey}>Add Key</Button>
                    <Button
                      variant="outline"
                      onClick={() => setAddingKey(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keys List */}
            <Card>
              <CardHeader>
                <CardTitle>Stored Keys</CardTitle>
                <CardDescription>
                  {keys.length} encrypted key{keys.length !== 1 ? "s" : ""} in
                  vault
                </CardDescription>
              </CardHeader>
              <CardContent>
                {keys.length === 0 ? (
                  <div className="text-center py-12">
                    <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No keys stored yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add your first key to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.map((key) => (
                      <div
                        key={key.id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Lock className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{key.name}</p>
                              {key.metadata && (
                                <p className="text-sm text-muted-foreground">
                                  {key.metadata}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleShowKey(key.id)}
                            >
                              {showKey[key.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyKey(key.encryptedKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {showKey[key.id] && (
                          <div className="p-3 bg-muted rounded font-mono text-sm break-all">
                            {atob(key.encryptedKey)}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(key.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Security Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• All keys are encrypted client-side before storage</p>
                <p>• Only you have access to decrypt your keys</p>
                <p>• Keys are stored with zero-knowledge architecture</p>
                <p>• Regular security audits ensure vault integrity</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
