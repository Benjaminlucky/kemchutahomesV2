import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { reviews } from "../../../data";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

function Reviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  });

  return (
    <section
      ref={ref}
      className="review__section w-full relative overflow-hidden"
      style={{
        background: "#ffffff",
        paddingTop: "5rem",
        paddingBottom: "7rem",
      }}
    >
      {/* Background blob */}
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

      <div className="review__wrapper w-11/12 md:w-10/12 mx-auto relative z-10">
        {/* ── Section header ────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14 md:mb-20"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{
              background: "rgba(112,12,235,0.07)",
              border: "1px solid rgba(112,12,235,0.15)",
              color: PURPLE,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: PURPLE }}
            />
            Client Testimonials
          </div>
          <h2
            className="font-black uppercase"
            style={{
              fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#0a0412",
            }}
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
          <p
            className="text-gray-400 mt-4 text-base md:text-lg mx-auto"
            style={{ maxWidth: 460 }}
          >
            Hear from clients who've built wealth and secured their futures with
            Kemchuta Homes
          </p>
        </motion.div>

        {/* ── Overall rating strip ─────────────────────────────────── */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-12"
          variants={fadeUp(0.15)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="#f59e0b" stroke="#f59e0b" />
            ))}
          </div>
          <span
            className="font-black text-gray-900 text-lg"
            style={{ letterSpacing: "-0.03em" }}
          >
            4.9
          </span>
          <span className="text-gray-400 text-sm">
            from 500+ verified clients
          </span>
        </motion.div>

        {/* ── Swiper ───────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp(0.2)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
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
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  className="review h-full"
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
                  {/* Quote mark */}
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
                    "
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? "#f59e0b" : "none"}
                          stroke={i < review.rating ? "#f59e0b" : "#d1d5db"}
                        />
                      ))}
                  </div>

                  {/* Review text */}
                  <p
                    className="text-gray-600 text-sm leading-relaxed mb-6"
                    style={{ lineHeight: 1.75 }}
                  >
                    {review.review}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 mb-5" />

                  {/* Reviewer */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border: "2px solid rgba(112,12,235,0.15)" }}
                    >
                      <img
                        src={review.img}
                        alt={review.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <h5
                        className="font-black text-gray-900 text-sm"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        {review.name}
                      </h5>
                      <p className="text-gray-400 text-xs font-medium">
                        {review.investment}
                      </p>
                    </div>
                    {/* Verified badge */}
                    <div className="ml-auto">
                      <div
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          background: "rgba(112,12,235,0.07)",
                          color: PURPLE,
                        }}
                      >
                        ✓ Verified
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Pagination */}
          <div className="review-pagination flex justify-center mt-6" />
        </motion.div>

        {/* ── Bottom CTA ────────────────────────────────────────────── */}
        <motion.div
          className="text-center mt-14"
          variants={fadeUp(0.4)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <a
            href="/developments"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              boxShadow: "0 8px 28px rgba(112,12,235,0.35)",
            }}
          >
            Start Your Investment Journey
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M7 2l5 5-5 5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Pagination dot styles */}
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

export default Reviews;
