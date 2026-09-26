import { motion } from "framer-motion";

/**
 * eyebrow, title, description — same as before, always required.
 * image  — optional photo URL. When supplied, the hero switches to a two-column
 *          layout (text + photo) instead of the plain centered banner.
 * badges — optional array of {icon, label} chips overlaid on the image corners.
 * cta    — optional {label, to} rendered as a button under the description.
 */
export default function PageHero({ eyebrow, title, description, image, badges = [], cta }) {
  if (!image) {
    return (
      <section className="bg-soft py-20">
        <div className="container-page max-w-4xl text-center">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="section-title">{title}</h1>
          <p className="section-description">{description}</p>
          {cta && (
            <a className="btn-primary mt-7 inline-flex" href={cta.to}>
              {cta.label}
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden bg-gradient-to-br from-white via-white to-[#EFF8F2] py-16 lg:py-20">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-navy md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-500 md:text-lg">{description}</p>
          {cta && (
            <a className="btn-primary mt-7 inline-flex" href={cta.to}>
              {cta.label}
            </a>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 shadow-2xl shadow-slate-200/60">
            <img
              src={image}
              alt=""
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              loading="lazy"
            />
          </div>
          {badges.map(({ icon: Icon, label }, index) => (
            <div
              key={label}
              className={`absolute hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-extrabold text-navy shadow-xl sm:flex ${
                index === 0 ? "-left-4 top-8 sm:-left-6" : "-right-4 bottom-8 sm:-right-6"
              }`}
            >
              <Icon size={15} className="text-primary" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}