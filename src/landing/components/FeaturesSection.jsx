import { Sparkles, Building2, ShieldCheck, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import { useInView } from "framer-motion";

const useInView = (options = { threshold: 0.2 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Document Generation",
    description:
      "Generate structured business documents using AI grounded in your business context.",
    highlighted: true,
  },
  {
    icon: Building2,
    title: "Business-Aware AI",
    description:
      "Create documents using your company profile, goals, audience, and brand information.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in Guidance",
    description:
      "Identify missing sections, risks, and areas that could be improved before you send your document.",
  },
  {
    icon: Wand2,
    title: "AI Assistant",
    description:
      "Rewrite, shorten, expand, and improve sections without starting over.",
  },
];

const Reveal = ({ show, delay = 0, className = "", children }) => (
  <div
    className={`transition-all ease-out duration-700 ${
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    } ${className}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  highlighted,
  show,
  delay,
}) => (
  <Reveal show={show} delay={delay}>
    <div
      className={`h-full rounded-2xl border p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-1 ${
        highlighted
          ? "bg-indigo-700 border-indigo-700 shadow-[0_20px_45px_-15px_rgba(67,56,202,0.55)]"
          : "bg-white border-gray-200 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.15)]"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${
          highlighted ? "bg-white/15" : "bg-indigo-50"
        }`}
      >
        <Icon
          size={18}
          className={highlighted ? "text-white" : "text-indigo-600"}
        />
      </div>
      <h3
        className={`text-base sm:text-lg font-semibold mb-2 ${
          highlighted ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed ${
          highlighted ? "text-indigo-100" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  </Reveal>
);

const FeaturesSection = () => {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <section
      id="features"
      ref={ref}
      className="w-full relative bg-slate-50 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-26"
    >
      <div className="mx-auto max-w-5xl text-center">
        <Reveal show={inView} delay={0} className="flex justify-center">
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700">
            Built for modern businesses
          </span>
        </Reveal>

        <Reveal show={inView} delay={80}>
          <h2 className="mt-5 text-[1.75rem] leading-[1.15] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-balance">
            Turn Your Business Ideas Into Professional Documents In Minutes.
          </h2>
        </Reveal>

        <Reveal show={inView} delay={160}>
          <p className="mt-5 text-sm sm:text-base text-slate-500 mx-auto text-balance">
            AHIIA.AI uses AI to help create proposals, business plans,
            contracts, SOPs and more from the information you already have.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 sm:mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            show={inView}
            delay={240 + i * 90}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
