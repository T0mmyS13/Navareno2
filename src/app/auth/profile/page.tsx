"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Input,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Alert
} from "@/components/ui";
import { 
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  profilePic: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    profilePic: ""
  });

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Výchozí avatary
  const defaultAvatars = [
    "/images/panda.png",
    "/images/cat.png",
    "/images/chicken.png",
    "/images/man.png",
    "/images/woman.png"
  ];
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/profile");
      
      if (!response.ok) {
        throw new Error("Nepodařilo se načíst profil");
      }
      
      const data = await response.json();
      setProfile(data);
      setFormData({
        username: data.username || "",
        profilePic: data.profilePic || ""
      });
    } catch (error) {
      setError("Nepodařilo se načíst profil");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      username: profile?.username || "",
      profilePic: profile?.profilePic || ""
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setError("Uživatelské jméno je povinné");
      return;
    }
    try {
      setSaving(true);
      setError("");
      let profilePicUrl = formData.profilePic;
      if (profilePicFile) {
        // Nahraj obrázek na server nebo použij URL.createObjectURL (dočasně)
        // Zde pouze simulujeme upload, v produkci by se měl obrázek uložit na server a získat URL
        profilePicUrl = URL.createObjectURL(profilePicFile);
      }
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, profilePic: profilePicUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nepodařilo se uložit změny");
      }

      await update();
      await fetchProfile();
      
      setEditing(false);
      setSuccess("Profil byl úspěšně aktualizován");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nepodařilo se uložit změny");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setError("");
    setSuccess("");
  };

  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Všechna pole jsou povinná");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Nová hesla se neshodují");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Nové heslo musí mít alespoň 6 znaků");
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        let errorMessage = "Nepodařilo se změnit heslo";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setSuccess("Heslo bylo úspěšně změněno");
    } catch (error) {
      console.error("Password change error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Nepodařilo se spojit se serverem. Zkuste to prosím znovu.");
      } else {
        setError(error instanceof Error ? error.message : "Nepodařilo se změnit heslo");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Alert variant="error">Nepodařilo se načíst profil</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Můj profil</h1>

      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="text-center p-6">
              <div className="mb-4">
                {profile.profilePic ? (
                  <Image
                    src={profile.profilePic}
                    alt="Profilová fotka"
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full mx-auto object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-30 h-30 rounded-full mx-auto bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                    {profile.username ? profile.username.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {profile.username}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {profile.email}
              </p>
              
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Registrován: {formatDate(profile.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Údaje o profilu</CardTitle>
                {!editing && (
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Upravit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">E-mail</span>
                </div>
                <p className="ml-6 text-gray-900">{profile.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Uživatelské jméno</span>
                </div>
                {editing ? (
                  <div className="ml-6">
                    <Input
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Zadejte uživatelské jméno"
                      label=""
                    />
                  </div>
                ) : (
                  <p className="ml-6 text-gray-900">{profile.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Profilová fotka</span>
                </div>
                {editing ? (
                  <div className="ml-6 flex flex-col gap-3">
                    <div className="flex gap-2 flex-wrap mt-1">
                      {defaultAvatars.map((avatar, idx) => (
                        <button
                          key={avatar}
                          type="button"
                          title={`Vybrat avatar ${idx + 1}`}
                          className={`focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full ${formData.profilePic === avatar ? 'ring-4 ring-blue-400' : ''}`}
                          onClick={() => { setFormData(f => ({ ...f, profilePic: avatar })); setProfilePicFile(null); }}
                        >
                          <Image
                            src={avatar}
                            alt={`Avatar ${idx + 1}`}
                            width={72}
                            height={72}
                            className={`w-20 h-20 rounded-full border-2 cursor-pointer transition-all duration-150 ${formData.profilePic === avatar ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1 mt-4">
                      <label className="text-base font-semibold text-blue-700">Nahrát vlastní profilovku</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-200 file:text-blue-700 file:font-semibold file:cursor-pointer text-base"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          setProfilePicFile(file);
                          setFormData(f => ({ ...f, profilePic: file ? "" : f.profilePic }));
                        }}
                      />
                      {profilePicFile && (
                        <div className="flex items-center gap-2 mt-2">
                          <Image
                            src={URL.createObjectURL(profilePicFile)}
                            alt="Náhled"
                            width={72}
                            height={72}
                            className="w-20 h-20 rounded-full border-2 border-blue-400"
                          />
                          <span className="text-base text-gray-700">Náhled</span>
                          <button
                            type="button"
                            className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                            onClick={() => { setProfilePicFile(null); }}
                          >Odebrat</button>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 mt-1">Podporované formáty: JPG, PNG, GIF. Max. velikost 2MB.</span>
                    </div>
                  </div>
                ) : (
                  <div className="ml-6">
                    {profile.profilePic ? (
                      <Image src={profile.profilePic} alt="Profilová fotka" width={72} height={72} className="inline w-20 h-20 rounded-full border-2 border-blue-400" />
                    ) : (
                      <span className="text-gray-500">Není nastavena</span>
                    )}
                  </div>
                )}
              </div>

              {editing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Uložit
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Zrušit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
          {showPasswordForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Změna hesla</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                    label="Současné heslo"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                    label="Nové heslo"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                    label="Potvrzení nového hesla"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handlePasswordSave} loading={changingPassword}>
                    <Lock className="w-4 h-4 mr-2" />
                    Změnit heslo
                  </Button>
                  <Button variant="outline" onClick={handlePasswordCancel} disabled={changingPassword}>
                    <X className="w-4 h-4 mr-2" />
                    Zrušit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Změnit heslo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
