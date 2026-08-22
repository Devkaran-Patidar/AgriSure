import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { getDashboardPathByRole } from "../../lib/routeSecurity";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login } = useAuth();
  const nav = useNavigate();

  const [error, setError] = useState("");

  const submit = async (d) => {
    try {
      const data = await login(d.email, d.password);

      nav(getDashboardPathByRole(data?.user?.role));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="min-h-[calc(100vh-144px)] bg-soft py-16">
      <div className="container-page max-w-md">
        <div className="card">
          {/* Header */}
          <span className="eyebrow">Secure Login</span>

          <h1 className="mt-5 font-heading text-3xl font-extrabold text-navy">
            Welcome back
          </h1>

          {/* Error Message */}
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(submit)}
            className="mt-7 grid gap-5"
          >
            {/* Email */}
            <label>
              <span className="label">Email</span>

              <input
                type="email"
                className="input"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                })}
              />

              {errors.email && (
                <span className="error">
                  {errors.email.message}
                </span>
              )}
            </label>

            {/* Password */}
            <label>
              <span className="label">Password</span>

              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
              />

              {errors.password && (
                <span className="error">
                  {errors.password.message}
                </span>
              )}
            </label>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary"
            >
              Login
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-sm text-slate-500">
            New here?{" "}
            <Link
              className="font-bold text-primary"
              to="/register"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}