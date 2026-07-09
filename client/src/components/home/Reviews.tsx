"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { reviews } from "@/lib/homeData";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

export default function Reviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

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
      style={{ background: "#ffffff", paddingTop: "5rem", paddingBottom: "7rem" }}
    >
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-5%",
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
          bottom: "5%",
          right: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.03)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 mx-auto w-11/12 md:w-10/12">
        <motion.div className="mb-14 text-center md:mb-20" variants={fadeUp(0)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
            style={{ background: "rgba(112,12,235,0.07)", border: "1px solid rgba(112,12,235,0.15)", color: PURPLE }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: PURPLE }} />
            Client Testimonials
          </div>
          <h2
            className="font-black uppercase"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)", letterSpacing: "-0.04em", lineHeight: 1.05, color: "#0a0412" }}
          >
            What{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Investors
            </span>{" "}
            Are Saying
          </h2>
          <p className="mx-auto mt-4 text-base text-gray-400 md:text-lg" style={{ maxWidth: 460 }}>
            Hear from clients who&rsquo;ve built wealth and secured their
            futures with Kemchuta Homes
          </p>
        </motion.div>

        <motion.div className="mb-12 flex items-center justify-center gap-3" variants={fadeUp(0.15)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="#f59e0b" stroke="#f59e0b" />
            ))}
          </div>
          <span className="text-lg font-black text-gray-900" style={{ letterSpacing: "-0.03em" }}>
            4.9
          </span>
          <span className="text-sm text-gray-400">from 500+ verified clients</span>
        </motion.div>

        <motion.div variants={fadeUp(0.2)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1.3 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            pagination={{ clickable: true, el: ".review-pagination" }}
            className="reviews pb-12"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.name}>
                <motion.div
                  className="h-full"
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "28px 28px 24px",
                    border: "1px solid rgba(112,12,235,0.1)",
                    boxShadow: "0 4px 24px rgba(112,12,235,0.06)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 24,
                      fontSize: 60,
                      lineHeight: 1,
                      color: "rgba(112,12,235,0.06)",
                      fontFamily: "Georgia, serif",
                      fontWeight: 900,
                      pointerEvents: "none",
                    }}
                  >
                    &rdquo;
                  </div>

                  <div className="mb-4 flex items-center gap-0.5">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "#f59e0b" : "none"} stroke={i < review.rating ? "#f59e0b" : "#d1d5db"} />
                      ))}
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-gray-600" style={{ lineHeight: 1.75 }}>
                    {review.review}
                  </p>

                  <div className="mb-5 h-px bg-gray-100" />

                  <div className="flex items-center gap-3">
                    <div
                      className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full"
                      style={{ border: "2px solid rgba(112,12,235,0.15)" }}
                    >
                      <Image src={review.img} alt={review.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                        {review.name}
                      </h5>
                      <p className="text-xs font-medium text-gray-400">{review.investment}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "rgba(112,12,235,0.07)", color: PURPLE }}>
                        ✓ Verified
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="review-pagination mt-6 flex justify-center" />
        </motion.div>

        <motion.div className="mt-14 text-center" variants={fadeUp(0.4)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <Link
            href="/developments"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, boxShadow: "0 8px 28px rgba(112,12,235,0.35)" }}
          >
            Start Your Investment Journey
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .review-pagination .swiper-pagination-bullet {
          width: 8px; height: 8px;
          background: rgba(112,12,235,0.25);
          border-radius: 50%; cursor: pointer;
          transition: all 0.3s;
          display: inline-block; margin: 0 3px;
        }
        .review-pagination .swiper-pagination-bullet-active {
          background: #700CEB;
          width: 24px; border-radius: 4px;
        }
      `}</style>
    </section>
  );
}
