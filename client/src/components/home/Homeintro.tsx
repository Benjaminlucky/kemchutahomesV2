"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

const stats = [
  { value: "500+", label: "Active Realtors" },
  { value: "₦2B+", label: "Deals Closed" },
  { value: "15+", label: "Estates Available" },
  { value: "5,000+", label: "Families Housed" },
];

export default function Homeintro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay },
    },
  });

  return (
    <section className="relative w-full overflow-hidden">
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.04)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.03)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div ref={ref} className="mx-auto w-11/12 py-20 md:w-10/12 md:py-32">
        <motion.div
          className="mb-6 flex justify-center"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase"
            style={{
              background: "rgba(112,12,235,0.07)",
              border: "1px solid rgba(112,12,235,0.18)",
              color: PURPLE,
            }}
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: PURPLE }}
            />
            Nigeria&rsquo;s Leading Real Estate Company
          </div>
        </motion.div>

        <motion.div
          className="mb-8 text-center"
          variants={fadeUp(0.1)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <h1
            className="leading-none font-black tracking-tight uppercase"
            style={{
              fontSize: "clamp(2rem, 7vw, 6rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Building Futures,
          </h1>
          <h1
            className="leading-none font-black tracking-tight uppercase"
            style={{
              fontSize: "clamp(2rem, 7vw, 6rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            One{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Estate
            </span>{" "}
            at a Time
          </h1>
        </motion.div>

        <motion.p
          className="mx-auto text-center leading-relaxed text-gray-500"
          style={{ maxWidth: 640, fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
          variants={fadeUp(0.2)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          At Kemchuta Homes Limited, we specialise in providing prime estate
          lands perfect for building your future. Whether you&rsquo;re an
          investor or an individual ready to create a home — your journey to
          land ownership starts here.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={fadeUp(0.3)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Link
            href="/developments"
            className="rounded-full px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              boxShadow: "0 8px 28px rgba(112,12,235,0.35)",
            }}
          >
            Explore Estates
          </Link>
          <Link
            href="/contact"
            className="rounded-full px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-customPurple-50"
            style={{ border: "2px solid rgba(112,12,235,0.3)", color: PURPLE }}
          >
            Talk to an Expert
          </Link>
        </motion.div>

        <motion.div
          className="my-16 flex items-center gap-4 md:my-20"
          variants={fadeUp(0.35)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})` }}
          />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-0"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp(0.4 + i * 0.08)}
              className="relative text-center"
            >
              {i > 0 && (
                <div
                  className="absolute top-1/2 left-0 hidden h-12 w-px -translate-y-1/2 md:block"
                  style={{ background: "rgba(112,12,235,0.12)" }}
                />
              )}
              <p
                className="mb-1 leading-none font-black"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  letterSpacing: "-0.04em",
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </p>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
