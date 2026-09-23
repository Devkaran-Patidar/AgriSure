import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../../lib/api";

export default function VerifyOTP() {
  const nav = useNavigate();
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6 digit OTP.");
      return;
    }

    try {
      await apiRequest("/accounts/auth/verify-otp/", {
        method: "POST",
        body: JSON.stringify({ email: state?.email, otp })
      });
      nav("/login");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="min-h-[calc(100vh-144px)] bg-soft py-16">
      <div className="container-page max-w-md">
        <div className="card">
          <span className="eyebrow">Verification</span>
          <h1 className="mt-5 font-heading text-3xl font-extrabold text-navy">
            Verify OTP
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            A one-time code was sent to {state?.email || "your email"}. Enter it to continue.
          </p>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="mt-7 grid gap-4">
            <label>
              <span className="label">OTP Code</span>
              <input
                className="input"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setError("");
                  setOtp(e.target.value.replace(/\D/g, ""));
                }}
                placeholder="Enter 6 digit code"
              />
            </label>

            <button type="submit" className="btn-primary">
              Verify OTP
            </button>
            <p className="text-sm text-slate-500">
              Didn't receive the code? <button className="text-blue-500 hover:underline">Resend</button>
            </p>

            
          </form>
          <br />
          <h6>Note:</h6>
    <p className="text-sm text-slate-500">
      Submit your application for verification.
    </p>
    <p className="text-sm text-slate-500">
        Once your application is verified, you will receive a confirmation email.
        You can then log in to your account.</p>
        
        </div>
      </div>
    </section>
  );
}
