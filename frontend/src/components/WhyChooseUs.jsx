import { FaShieldAlt, FaShoppingBag, FaHeadset } from "react-icons/fa";

const whyChooseUs = [
  {
    icon: FaShieldAlt,
    title: "From a Trusted Brand",
    description:
      "We carry forward a legacy of trust and quality, delivering the best to your doorstep.",
  },
  {
    icon: FaShoppingBag,
    title: "Omni Channel Experience",
    description:
      "Shop seamlessly online or in-store with a unified experience tailored for you.",
  },
  {
    icon: FaHeadset,
    title: "Expert Advice",
    description:
      "Get personalized recommendations from experts who understand your needs.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mt-16 bg-[#d9d9d9] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-4xl font-semibold text-white">Why Choose Us?</h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {whyChooseUs.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[20px] bg-gradient-to-b from-blue-700 to-purple-700 px-8 py-10 text-center text-white shadow-lg"
              >
                <Icon className="mx-auto text-4xl" />
                <h3 className="mt-6 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-5 text-lg leading-8 text-white/95">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
