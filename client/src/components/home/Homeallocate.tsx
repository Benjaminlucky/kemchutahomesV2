"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { allocate } from "@/lib/homeData";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

export default function Homeallocate() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay },
    },
  });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "#f8f5ff", paddingTop: "5rem", paddingBottom: "7rem" }}
    >
      <div
        style={{
          position: "absolute",
          top: "-5%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.05)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 mx-auto w-11/12 md:w-10/12">
        <motion.div
          className="mb-12 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
              style={{ background: "rgba(112,12,235,0.07)", border: "1px solid rgba(112,12,235,0.15)", color: PURPLE }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: PURPLE }} />
              On the Ground
            </div>
            <h2
              className="font-black uppercase"
              style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", letterSpacing: "-0.04em", lineHeight: 1.05, color: "#0a0412" }}
            >
              Updates &{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Activities
              </span>
            </h2>
          </div>
          <p className="text-sm text-gray-500 md:text-right md:text-base" style={{ maxWidth: 300 }}>
            Real developments, real progress — see what&rsquo;s happening
            across our estates right now
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {allocate.map((update, index) => {
            const isTall = index === 0 || index === 3;
            return (
              <motion.div
                className="group relative overflow-hidden rounded-2xl"
                key={update.img}
                style={{ gridRow: isTall ? "span 2" : "span 1" }}
                variants={fadeUp(0.1 + index * 0.06)}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
              >
                <div
                  className="relative h-full w-full"
                  style={{ minHeight: isTall ? 420 : 200 }}
                >
                  <Image
                    src={update.img}
                    alt={`Activity ${index + 1}`}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={index < 2}
                  />

                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(to top, rgba(112,12,235,0.6) 0%, rgba(112,12,235,0.1) 60%, transparent 100%)",
                    }}
                  />

                  <div
                    className="absolute top-3 left-3 rounded-lg px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "rgba(112,12,235,0.85)", backdropFilter: "blur(8px)" }}
                  >
                    Live Update
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div className="mt-12 flex justify-center" variants={fadeUp(0.6)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <Link
            href="/developments"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, boxShadow: "0 8px 28px rgba(112,12,235,0.35)" }}
          >
            View All Developments
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
