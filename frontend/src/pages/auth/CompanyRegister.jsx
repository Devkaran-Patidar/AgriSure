import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { apiRequest } from "../../lib/api";

export default function CompanyRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const nav = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (d) => {
    setError("");
    setLoading(true);

    try {
      const payload = {
  role: "COMPANY",

  email: d.email,
  password: d.password,
  phone: d.phone,

  company: {
    company_name: d.company_name,
    business_type: d.business_type,
    contact_person: d.contact_person,
    company_address: d.company_address,
    gst_number: d.gst_number,
    licence_number: d.licence_number,
  },
};

      await apiRequest("/accounts/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // According to the AgriSure plan:
      // Registration → OTP Verification → Account Creation/Login
      nav("/verify-otp", {
        state: {
          email: d.email,
          role: "COMPANY",
        },
      });
    } catch (e) {
      setError(e.message || "Company registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-soft py-14">
      <div className="container-page max-w-4xl">
        <div className="card">

          {/* HEADER */}
          <span className="eyebrow">Buyer Onboarding</span>

          <h1 className="mt-5 font-heading text-3xl font-extrabold text-navy">
            Register as Company
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Create your company account to connect with farmers and manage
            contract farming agreements.
          </p>

          {/* ERROR */}
          {error && (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit(submit)}
            className="mt-8 grid gap-5 sm:grid-cols-2"
          >

            {/* COMPANY NAME */}
            <label>
              <span className="label">Company Name *</span>

              <input
                type="text"
                className="input"
                placeholder="Enter registered company name"
                {...register("company_name", {
                  required: "Company name is required",
                })}
              />

              {errors.company_name && (
                <span className="error">
                  {errors.company_name.message}
                </span>
              )}
            </label>

            {/* BUSINESS TYPE */}
            <label>
              <span className="label">Business Type *</span>

              <select
                className="input"
                {...register("business_type", {
                  required: "Business type is required",
                })}
              >
                <option value="">Select business type</option>

                <option value="FOOD_PROCESSOR">
                  Food Processing Company
                </option>

                <option value="AGRICULTURAL_BUSINESS">
                  Agricultural Business
                </option>

                <option value="RETAILER">
                  Retailer
                </option>

                <option value="EXPORTER">
                  Exporter
                </option>

                <option value="WHOLESALER">
                  Wholesaler
                </option>

                <option value="AGGREGATOR">
                  Aggregator
                </option>

                <option value="INSTITUTIONAL_BUYER">
                  Institutional Buyer
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>

              {errors.business_type && (
                <span className="error">
                  {errors.business_type.message}
                </span>
              )}
            </label>

            {/* EMAIL */}
            <label>
              <span className="label">Company Email *</span>

              <input
                type="email"
                className="input"
                placeholder="company@example.com"
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

            {/* PHONE */}
            <label>
              <span className="label">Phone Number *</span>

              <input
                type="tel"
                className="input"
                placeholder="Enter 10-digit phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
              />

              {errors.phone && (
                <span className="error">
                  {errors.phone.message}
                </span>
              )}
            </label>

            {/* PASSWORD */}
            <label>
              <span className="label">Password *</span>

              <input
                type="password"
                className="input"
                placeholder="Create a secure password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must contain at least 8 characters",
                  },
                })}
              />

              {errors.password && (
                <span className="error">
                  {errors.password.message}
                </span>
              )}
            </label>

            {/* CONTACT PERSON */}
            <label>
              <span className="label">Contact Person *</span>

              <input
                type="text"
                className="input"
                placeholder="Authorized contact person"
                {...register("contact_person", {
                  required: "Contact person is required",
                })}
              />

              {errors.contact_person && (
                <span className="error">
                  {errors.contact_person.message}
                </span>
              )}
            </label>

            {/* COMPANY ADDRESS */}
            <label className="sm:col-span-2">
              <span className="label">Company Address *</span>

              <textarea
                className="input min-h-100px"
                placeholder="Enter complete company address"
                {...register("company_address", {
                  required: "Company address is required",
                })}
              />

              {errors.company_address && (
                <span className="error">
                  {errors.company_address.message}
                </span>
              )}
            </label>

            {/* GST */}
            <label>
              <span className="label">GST Number</span>

              <input
                type="text"
                className="input"
                placeholder="Enter GST number"
                {...register("gst_number")}
              />
            </label>

            {/* LICENCE */}
            <label>
              <span className="label">Licence Number</span>

              <input
                type="text"
                className="input"
                placeholder="Enter licence number"
                {...register("licence_number")}
              />
            </label>

            {/* SUBMIT */}
            <div className="sm:col-span-2 mt-3">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Company Account"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}