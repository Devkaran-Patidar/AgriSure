import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../../lib/api";

export default function FarmerRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const nav = useNavigate();
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const submit = async (d) => {
    try {
      await apiRequest("/accounts/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          role: "FARMER",
          email: d.email,
          password: d.password,
          phone: d.phone,
          first_name: d.first_name,
          last_name: d.last_name,
          farmer: {
            farm_name: d.farm_name,
            address: d.address,
            state: d.state,
            district: d.district,
            land_size_acres: d.land_size_acres,
            khasra_number: d.khasra_number,
          },
        }),
      });

      nav("/verify-otp", { state: { email: d.email } });
    } catch (e) {
      setError(e.message);
    }
  };

  const nextStep = () => {
    setStep(2);
  };

  const previousStep = () => {
    setStep(1);
  };

  return (
    <section className="bg-soft py-14">
      <div className="container-page max-w-4xl">
        <div className="card">
          <span className="eyebrow">Farmer Onboarding</span>

          <h1 className="mt-5 font-heading text-3xl font-extrabold text-navy">
            Register as Farmer
          </h1>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center gap-3">
            <div
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                step === 1
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              1. Personal Details
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                step === 2
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              2. Farm Details
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit(submit)}
            className="mt-8 grid gap-5 sm:grid-cols-2"
          >
            {/* PART 1 */}
            {step === 1 && (
              <>
                <label>
                  <span className="label">First Name</span>
                  <input
                    type="text"
                    className="input"
                    {...register("first_name", {
                      required: "First Name is required",
                    })}
                  />
                  {errors.first_name && (
                    <span className="error">
                      {errors.first_name.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">Last Name</span>
                  <input
                    type="text"
                    className="input"
                    {...register("last_name", {
                      required: "Last Name is required",
                    })}
                  />
                  {errors.last_name && (
                    <span className="error">
                      {errors.last_name.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">Email</span>
                  <input
                    type="email"
                    className="input"
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

                <label>
                  <span className="label">Phone</span>
                  <input
                    type="text"
                    className="input"
                    {...register("phone", {
                      required: "Phone is required",
                    })}
                  />
                  {errors.phone && (
                    <span className="error">
                      {errors.phone.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">Password</span>
                  <input
                    type="password"
                    className="input"
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

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* PART 2 */}
            {step === 2 && (
              <>
                <label>
                  <span className="label">Farm / FPO Name</span>
                  <input
                    type="text"
                    className="input"
                    {...register("farm_name", {
                      required: "Farm / FPO Name is required",
                    })}
                  />
                  {errors.farm_name && (
                    <span className="error">
                      {errors.farm_name.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">Address</span>
                  <input
                    type="text"
                    className="input"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  />
                  {errors.address && (
                    <span className="error">
                      {errors.address.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">District</span>
                  <input
                    type="text"
                    className="input"
                    {...register("district", {
                      required: "District is required",
                    })}
                  />
                  {errors.district && (
                    <span className="error">
                      {errors.district.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">State</span>
                  <input
                    type="text"
                    className="input"
                    {...register("state", {
                      required: "State is required",
                    })}
                  />
                  {errors.state && (
                    <span className="error">
                      {errors.state.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">Land Size (acres)</span>
                  <input
                    type="number"
                    className="input"
                    {...register("land_size_acres", {
                      required: "Land Size is required",
                    })}
                  />
                  {errors.land_size_acres && (
                    <span className="error">
                      {errors.land_size_acres.message}
                    </span>
                  )}
                </label>

                <label>
                  <span className="label">Khasra Number of Land</span>
                  <input
                    type="text"
                    className="input"
                    {...register("khasra_number", {
                      required: "Khasra Number is required",
                    })}
                  />
                  {errors.khasra_number && (
                    <span className="error">
                      {errors.khasra_number.message}
                    </span>
                  )}
                </label>

                <div className="sm:col-span-2 flex gap-4">
                  <button
                    type="button"
                    onClick={previousStep}
                    className="btn-secondary"
                  >
                    Previous
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Farmer Account
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}