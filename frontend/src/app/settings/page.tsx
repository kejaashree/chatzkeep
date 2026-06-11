"use client";
import { useState } from "react";
import { Settings as SettingsIcon, User, Save, Camera } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
      country: user?.address?.country || "India",
    },
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateAddr = (field: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", form);
      updateUser(data);
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await api.post("/upload/avatar", formData);
      await api.put("/users/profile", { avatar: data.avatarUrl });
      updateUser({ ...user!, avatar: data.avatarUrl });
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  const initials = user
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Settings"
          extraAction={
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <span>+</span> Create
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6">
            {/* Left panel */}
            <div className="w-48">
              <div className="bg-white rounded-xl p-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium">
                  <SettingsIcon className="w-4 h-4" />
                  General
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl p-8">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-primary-600 text-2xl font-bold">{initials}</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* Personal Information */}
                <section className="mb-8">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Personal information
                  </h2>
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First name">
                        <input
                          value={form.firstName}
                          onChange={(e) => update("firstName", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                      <Field label="Last name">
                        <input
                          value={form.lastName}
                          onChange={(e) => update("lastName", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                      <Field label="Email address">
                        <input
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                      <Field label="Phone number">
                        <input
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                      <Field label="Bio" className="col-span-2">
                        <textarea
                          value={form.bio}
                          onChange={(e) => update("bio", e.target.value)}
                          rows={3}
                          className="input-style resize-none"
                        />
                      </Field>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <InfoItem label="First name" value={user?.firstName} />
                      <InfoItem label="Last name" value={user?.lastName} />
                      <InfoItem label="Email address" value={user?.email} />
                      <InfoItem label="Phone number" value={user?.phone || "—"} />
                      {user?.bio && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 mb-1">Bio</p>
                          <p className="text-sm text-gray-700">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Address */}
                <section className="mb-8">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Address</h2>
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Country">
                        <input
                          value={form.address.country}
                          onChange={(e) => updateAddr("country", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                      <Field label="City / State">
                        <input
                          value={`${form.address.city}, ${form.address.state}`}
                          onChange={(e) => {
                            const [city, ...rest] = e.target.value.split(",");
                            updateAddr("city", city.trim());
                            updateAddr("state", rest.join(",").trim());
                          }}
                          className="input-style"
                        />
                      </Field>
                      <Field label="Postal code">
                        <input
                          value={form.address.pincode}
                          onChange={(e) => updateAddr("pincode", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                      <Field label="Area / Street">
                        <input
                          value={form.address.street}
                          onChange={(e) => updateAddr("street", e.target.value)}
                          className="input-style"
                        />
                      </Field>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <InfoItem label="country" value={user?.address?.country || "India"} />
                      <InfoItem
                        label="City / State"
                        value={
                          user?.address?.city && user?.address?.state
                            ? `${user.address.city}, ${user.address.state}`
                            : "—"
                        }
                      />
                      <InfoItem label="Postal code" value={user?.address?.pincode || "—"} />
                      <InfoItem label="Area" value={user?.address?.street || "—"} />
                    </div>
                  )}
                </section>

                {/* Map placeholder */}
                <div className="mb-6">
                  <p className="text-xs text-gray-400 mb-2">Detective map</p>
                  <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
                    📍 Map view — Choose on map
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Edit profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }
        .input-style:focus {
          ring: 2px;
          border-color: #2a8f6f;
        }
      `}</style>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value || "—"}</p>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
