import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/auth/LanguageSwitcher";

export default function FarmerRegister() {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm();

  const nav = useNavigate();
  const { t } = useLanguage();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const submit = async (d) => {
    setError("");
    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("role", "FARMER");
      payload.append("email", d.email);
      payload.append("password", d.password);
      payload.append("phone", d.phone);
      payload.append("first_name", d.first_name);
      payload.append("last_name", d.last_name);

      payload.append(
        "farmer",
        JSON.stringify({
          farm_name: d.farm_name,
          address: d.address,
          state: d.state,
          district: d.district,
          land_size_acres: d.land_size_acres,
          khasra_number: d.khasra_number,
          aadhar_number: d.aadhar_number,
          pan_number: d.pan_number,
          bank_account_number: d.bank_account_number,
          ifsc_code: d.ifsc_code,
          bank_name: d.bank_name,
          branch_name: d.branch_name,
        })
      );

      for (const file of d.documents || []) {
        payload.append("documents", file);
      }

      await apiRequest("/accounts/auth/register/", {
        method: "POST",
        body: payload,
      });

      nav("/verify-otp", {
        state: {
          email: d.email,
          role: "FARMER",
        },
      });
    } catch (e) {
      setError(e.message || "Farmer registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const valid = await trigger([
      "first_name",
      "last_name",
      "email",
      "phone",
      "password",
    ]);

    if (valid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-soft py-14">
      <div className="container-page max-w-4xl">
        <div className="card">
          <div className="mb-8">
            <div className="mb-6 flex justify-end"><LanguageSwitcher /></div>
            <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t("farmerOnboarding")}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {t("registerFarmer")}
            </h1>

            <p className="mt-2 text-gray-600">
              {t("farmerDescription")}
            </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div
              className={`rounded-xl border p-4 ${
                step === 1
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className="text-sm font-medium text-gray-500">{t("step")} 1</p>
              <p className="font-semibold text-gray-900">
                {t("personalDetails")}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                step === 2
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className="text-sm font-medium text-gray-500">{t("step")} 2</p>
              <p className="font-semibold text-gray-900">
                {t("farmDetails")}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(submit)}>
            {/* STEP 1 */}
            {step === 1 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  {t("accountDetails")}
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("firstName")}
                    </label>

                    <input
                      type="text"
                      placeholder={t("enterFirstName")}
                      {...register("first_name", {
                        required: `${t("firstName")} is required`,
                      })}
                      className="input"
                    />

                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("lastName")}
                    </label>

                    <input
                      type="text"
                      placeholder={t("enterLastName")}
                      {...register("last_name", {
                        required: `${t("lastName")} is required`,
                      })}
                      className="input"
                    />

                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("emailAddress")}
                    </label>

                    <input
                      type="email"
                      placeholder={t("enterEmail")}
                      {...register("email", {
                        required: `${t("email")} is required`,
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
                      {t("phoneNumber")}
                    </label>

                    <input
                      type="tel"
                      placeholder={t("enterPhone")}
                      {...register("phone", {
                        required: `${t("phoneNumber")} is required`,
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: t("enterPhone"),
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
                      {t("password")}
                    </label>

                    <input
                      type="password"
                      placeholder={t("createPassword")}
                      {...register("password", {
                        required: `${t("password")} is required`,
                        minLength: {
                          value: 8,
                          message:
                            `${t("password")} must be at least 8 characters`,
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

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Farm Details */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    {t("farmDetails")}
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Farm Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("farmFpoName")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterFarmName")}
                        {...register("farm_name", {
                          required: `${t("farmFpoName")} is required`,
                        })}
                        className="input"
                      />

                      {errors.farm_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.farm_name.message}
                        </p>
                      )}
                    </div>

                    {/* Land Size */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("landSize")}
                      </label>

                      <input
                        type="number"
                        step="0.01"
                        placeholder={t("enterLandSize")}
                        {...register("land_size_acres", {
                          required: `${t("landSize")} is required`,
                        })}
                        className="input"
                      />

                      {errors.land_size_acres && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.land_size_acres.message}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("farmAddress")}
                      </label>

                      <textarea
                        rows="3"
                        placeholder={t("enterFarmAddress")}
                        {...register("address", {
                          required: `${t("farmAddress")} is required`,
                        })}
                        className="input"
                      />

                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("district")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterDistrict")}
                        {...register("district", {
                          required: `${t("district")} is required`,
                        })}
                        className="input"
                      />

                      {errors.district && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.district.message}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("state")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterState")}
                        {...register("state", {
                          required: `${t("state")} is required`,
                        })}
                        className="input"
                      />

                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    {/* Khasra */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("khasra")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterKhasra")}
                        {...register("khasra_number", {
                          required: `${t("khasra")} is required`,
                        })}
                        className="input"
                      />

                      {errors.khasra_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.khasra_number.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identity & Bank */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    {t("identityBank")}
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Aadhaar */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("aadhaar")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterAadhaar")}
                        {...register("aadhar_number", {
                          required: `${t("aadhaar")} is required`,
                        })}
                        className="input"
                      />

                      {errors.aadhar_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.aadhar_number.message}
                        </p>
                      )}
                    </div>

                    {/* PAN */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("pan")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterPan")}
                        {...register("pan_number")}
                        className="input"
                      />
                    </div>

                    {/* Bank Account */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("bankAccount")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterBankAccount")}
                        {...register("bank_account_number", {
                          required: `${t("bankAccount")} is required`,
                        })}
                        className="input"
                      />

                      {errors.bank_account_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.bank_account_number.message}
                        </p>
                      )}
                    </div>

                    {/* IFSC */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("ifsc")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterIfsc")}
                        {...register("ifsc_code", {
                          required: `${t("ifsc")} is required`,
                        })}
                        className="input"
                      />

                      {errors.ifsc_code && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ifsc_code.message}
                        </p>
                      )}
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("bankName")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterBankName")}
                        {...register("bank_name", {
                          required: `${t("bankName")} is required`,
                        })}
                        className="input"
                      />

                      {errors.bank_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.bank_name.message}
                        </p>
                      )}
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t("branchName")}
                      </label>

                      <input
                        type="text"
                        placeholder={t("enterBranch")}
                        {...register("branch_name", {
                          required: `${t("branchName")} is required`,
                        })}
                        className="input"
                      />

                      {errors.branch_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.branch_name.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    {t("verificationDocuments")}
                  </h2>

                  <p className="mb-5 text-sm text-gray-500">
                    {t("uploadDocuments")}
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    {...register("documents")}
                    className="block w-full rounded-xl border border-gray-300 p-3 text-sm"
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={previousStep}
                    className="btn-secondary"
                  >
                    {t("previous")}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? t("submitVerification") : t("sending")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}