import React from "react";
import { motion } from "framer-motion";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay },
});

function CompanyIntro() {
  return (
    <article
      className="w-full overflow-hidden"
      style={{ background: "#faf9f6" }}
    >
      <div className="w-11/12 mx-auto pt-16 pb-12 md:pt-24 md:pb-16">
        {/* Eyebrow */}
        <motion.p
          {...fade(0)}
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#700CEB",
            marginBottom: 20,
          }}
        >
          Kemchuta Homes Limited — Est. 2018
        </motion.p>

        {/* Numbered giant headline */}
        <div
          style={{
            borderTop: "1px solid #e5e0d8",
            paddingTop: 24,
            marginBottom: 48,
          }}
        >
          {[
            { n: "01", text: "Who We", italic: false },
            { n: "02", text: "Are.", italic: true },
          ].map(({ n, text, italic }, i) => (
            <motion.div
              key={n}
              {...fade(i * 0.12)}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#bbb",
                  letterSpacing: "0.1em",
                  flexShrink: 0,
                  width: 28,
                }}
              >
                {n}
              </span>
              <h2
                style={{
                  fontSize: "clamp(3rem, 10vw, 9rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                  margin: 0,
                  color: italic ? "#700CEB" : "#0f0a1e",
                  fontStyle: italic ? "italic" : "normal",
                }}
              >
                {text}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* Two-column body text */}
        <motion.div
          {...fade(0.25)}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(24px, 6vw, 80px)",
            marginBottom: 64,
          }}
        >
          <p
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              lineHeight: 1.8,
              color: "#374151",
              margin: 0,
            }}
          >
            Founded with a passion for transforming modern living, we are a
            dynamic, forward-thinking company committed to shaping vibrant
            communities, creating lasting value, and enhancing lives through
            innovative, sustainable, and purposeful real estate ventures.
          </p>
          <p
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              lineHeight: 1.8,
              color: "#374151",
              margin: 0,
            }}
          >
            At Kemchuta Homes, we're more than a real estate business — we're
            your trusted partner in turning property ownership dreams into
            reality. Real estate is not just an investment; it's about building
            your future, securing your legacy, and finding the perfect place to
            call home.
          </p>
        </motion.div>
      </div>

      {/* Full-bleed image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", width: "100%", overflow: "hidden" }}
      >
        <img
          src="./assets/companyBG.jpg"
          alt="Kemchuta Homes estate"
          style={{
            width: "100%",
            display: "block",
            aspectRatio: "16/7",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(to top, rgba(10,6,24,0.7) 0%, transparent 100%)",
            padding: "40px 5%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Kemchuta Homes · Lekki &amp; Asaba
          </p>
          <p
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0 }}
          >
            Building legacies since 2018
          </p>
        </div>
      </motion.div>
    </article>
  );
}

export default CompanyIntro;
