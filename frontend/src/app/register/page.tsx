"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateAddress = (field: string, value: string) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName) {
      toast.error("Please fill required fields");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success("Account created successfully!");
      router.push("/messages");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const heroImages = [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-xl font-bold">
              Chatz<span className="text-primary-600">keep</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
            Register
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            welcome back! Sign in to your account.
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`w-8 h-2 rounded-full ${step >= 1 ? "bg-primary-600" : "bg-gray-200"}`}
            />
            <div
              className={`w-8 h-2 rounded-full ${step >= 2 ? "bg-primary-600" : "bg-gray-200"}`}
            />
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <FloatingInput
                label="First Name"
                value={formData.firstName}
                onChange={(v) => update("firstName", v)}
                required
              />
              <FloatingInput
                label="Last Name"
                value={formData.lastName}
                onChange={(v) => update("lastName", v)}
              />
              <FloatingInput
                label="email"
                type="email"
                value={formData.email}
                onChange={(v) => update("email", v)}
                placeholder="getwell@kmchhospitals.com"
                required
              />
              <FloatingInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(v) => update("password", v)}
                required
              />
              <FloatingInput
                label="Website (Optional)"
                value={formData.website}
                onChange={(v) => update("website", v)}
                placeholder="www.kmchhospitals.com"
              />
              <FloatingInput
                label="Phone number"
                value={formData.phone}
                onChange={(v) => update("phone", v)}
                placeholder="+91 422 – 4378720"
              />
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                label="Address"
                value={formData.address.street}
                onChange={(v) => updateAddress("street", v)}
                placeholder="No.18, Vivekananda Road, Ram Nagar"
              />
              <FloatingInput
                label="City"
                value={formData.address.city}
                onChange={(v) => updateAddress("city", v)}
                placeholder="Coimbatore"
              />
              <FloatingInput
                label="State"
                value={formData.address.state}
                onChange={(v) => updateAddress("state", v)}
                placeholder="Tamilnadu"
              />
              <FloatingInput
                label="Pincode"
                value={formData.address.pincode}
                onChange={(v) => updateAddress("pincode", v)}
                placeholder="641 009"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Submit"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Do you have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-8">
            ©2025 Chatzkeep. All rights reserved
          </p>
        </div>
      </div>

      {/* Right — Hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-green-400 to-blue-500" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 text-white text-center">
            <p className="text-2xl font-bold">Very good works are</p>
            <p className="text-2xl font-bold">waiting for you</p>
            <p className="text-xl font-semibold mt-1">Login Now</p>
          </div>
          <img
            src={heroImages[step - 1]}
            alt="Healthcare team"
            className="rounded-2xl w-64 h-64 object-cover shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
      />
    </div>
  );
}
