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
      const payload = new FormData();

      payload.append("role", "COMPANY");
      payload.append("email", d.email);
      payload.append("password", d.password);
      payload.append("phone", d.phone);

      payload.append(
        "company",
        JSON.stringify({
          company_name: d.company_name,
          business_type: d.business_type,
          contact_person: d.contact_person,
          company_address: d.company_address,
          gst_number: d.gst_number || "",
          licence_number: d.licence_number || "",
        })
      );

      for (const file of d.verification_documents || []) {
        payload.append("verification_documents", file);
      }

      await apiRequest("/accounts/auth/register/", {
        method: "POST",
        body: payload,
      });

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
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Buyer Onboarding
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Register as Company
            </h1>

            <p className="mt-2 text-gray-600">
              Create your company account to connect with farmers and manage
              contract farming agreements.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(submit)} className="space-y-6">
            {/* Account Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Account Details
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter company email"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    className="input"
                  />

                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit phone number",
                      },
                    })}
                    className="input"
                  />

                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Create a strong password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="input"
                  />

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Company Details
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Company Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter company name"
                    {...register("company_name", {
                      required: "Company name is required",
                    })}
                    className="input"
                  />

                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.company_name.message}
                    </p>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Business Type
                  </label>

                  <select
                    {...register("business_type", {
                      required: "Business type is required",
                    })}
                    className="input"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select business type
                    </option>

                    <option value="FOOD_PROCESSOR">
                      Food Processor
                    </option>

                    <option value="AGRICULTURAL_BUSINESS">
                      Agricultural Business
                    </option>

                    <option value="RETAILER">Retailer</option>

                    <option value="EXPORTER">Exporter</option>

                    <option value="WHOLESALER">Wholesaler</option>

                    <option value="AGGREGATOR">Aggregator</option>

                    <option value="INSTITUTIONAL_BUYER">
                      Institutional Buyer
                    </option>

                    <option value="OTHER">Other</option>
                  </select>

                  {errors.business_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.business_type.message}
                    </p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Contact Person
                  </label>

                  <input
                    type="text"
                    placeholder="Enter contact person name"
                    {...register("contact_person", {
                      required: "Contact person is required",
                    })}
                    className="input"
                  />

                  {errors.contact_person && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contact_person.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Address
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Enter complete company address"
                    {...register("company_address", {
                      required: "Company address is required",
                    })}
                    className="input"
                  />

                  {errors.company_address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.company_address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Verification */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Business Verification
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* GST */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    GST Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter GST number"
                    {...register("gst_number")}
                    className="input"
                  />
                </div>

                {/* Licence */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Licence Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter licence number"
                    {...register("licence_number")}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Verification Documents
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Upload GST, business licence, registration certificate, or
                other relevant documents.
              </p>

              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                {...register("verification_documents")}
                className="block w-full rounded-xl border border-gray-300 p-3 text-sm"
              />
            </div>

            {/* Terms */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("terms", {
                    required: "You must accept the terms and conditions",
                  })}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm leading-6 text-gray-600">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-medium text-primary hover:underline"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="font-medium text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {errors.terms && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Creating Account..." : "Create Company Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}