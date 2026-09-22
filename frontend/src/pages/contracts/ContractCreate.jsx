import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import { useState } from "react";

export default function ContractCreate() {
	const { register, handleSubmit } = useForm();
	const nav = useNavigate();
	const [error, setError] = useState("");

	const submit = async (data) => {
		try {
			const contract = await apiRequest("/contracts/", {
				method: "POST",
				body: JSON.stringify({
					crop: Number(data.crop),
					agreed_quantity: data.agreed_quantity,
					agreed_price: data.agreed_price || null,
					  delivery_location: data.delivery_location,
					  payment_terms: data.payment_terms,
					  terms_conditions: data.terms_conditions,
				}),
			});
			nav(`/company/contracts/${contract.id}`);
		} catch (requestError) {
			setError(requestError.message);
		}
	};

	return (
		<section className="bg-soft py-10">
			<div className="container-page max-w-2xl">
				<div className="card">
					<span className="eyebrow">Phase 3</span>
					<h1 className="mt-4 font-heading text-3xl font-extrabold text-navy">Create Contract</h1>
					{error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
					<form onSubmit={handleSubmit(submit)} className="mt-7 grid gap-5">
						<label>
							<span className="label">Crop ID</span>
							<input className="input" type="number" min="1" {...register("crop", { required: true })} />
						</label>
						<label>
							<span className="label">Agreed Quantity</span>
							<input className="input" type="number" min="0.01" step="0.01" {...register("agreed_quantity", { required: true })} />
						</label>
						<label>
							<span className="label">Agreed Price</span>
							<input className="input" type="number" min="0" step="0.01" {...register("agreed_price")} />
						</label>
						<label><span className="label">Delivery location</span><input className="input" {...register("delivery_location")} /></label>
						<label><span className="label">Payment terms</span><input className="input" placeholder="20% on activation, 80% on delivery" {...register("payment_terms")} /></label>
						<label className="sm:col-span-2"><span className="label">Terms and conditions</span><textarea className="input min-h-32" {...register("terms_conditions")} required /></label>
						<button className="btn-primary">Create Draft</button>
					</form>
				</div>
			</div>
		</section>
	);
}
