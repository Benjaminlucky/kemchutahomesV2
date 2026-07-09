import React from "react";
import { motion } from "framer-motion";

const pillars = [
  {
    n: "01",
    title: "Excellence",
    text: "We hold every project to the highest standards — from land acquisition to title delivery.",
  },
  {
    n: "02",
    title: "Integrity",
    text: "Transparent pricing, honest timelines, and contracts that protect our clients above all.",
  },
  {
    n: "03",
    title: "Innovation",
    text: "From Buy2Sell investment schemes to digital client portals — we build the future of property.",
  },
];

function CompanyMission() {
  return (
    <section
      className="w-full"
      style={{ background: "#faf9f6", overflow: "hidden" }}
    >
      <div className="w-11/12 mx-auto py-20 md:py-32">
        {/* Section header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 32,
            marginBottom: 64,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#700CEB",
                marginBottom: 12,
              }}
            >
              Our Mission
            </p>
            <h3
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "#0f0a1e",
                margin: 0,
                maxWidth: 600,
              }}
            >
              We Build
              <br />
              <span style={{ color: "#700CEB", fontStyle: "italic" }}>
                Communities.
              </span>
            </h3>
          </motion.div>

          {/* Pull quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            style={{
              maxWidth: 380,
              borderLeft: "4px solid #700CEB",
              paddingLeft: 24,
              alignSelf: "flex-end",
            }}
          >
            <p
              style={{
                fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
                lineHeight: 1.75,
                color: "#374151",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              "We envision a future where every individual's dream of owning
              their ideal home is realized — through real estate that inspires
              and elevates."
            </p>
          </motion.div>
        </div>

        {/* Two-column: image left, pillars right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(32px, 6vw, 80px)",
            alignItems: "start",
          }}
        >
          {/* Image with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative" }}
          >
            <div
              style={{
                position: "absolute",
                inset: -4,
                background:
                  "radial-gradient(ellipse at 30% 70%, rgba(112,12,235,0.25), transparent 70%)",
                borderRadius: 20,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <img
                src="./assets/missionBG.jpg"
                alt="Kemchuta Homes Mission"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "4/5",
                  objectFit: "cover",
                }}
              />
            </div>
          </motion.div>

          {/* Numbered pillars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pillars.map(({ n, title, text }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                  delay: i * 0.1,
                }}
                style={{
                  borderTop: "1px solid #e5e0d8",
                  padding: "28px 0",
                  display: "flex",
                  gap: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#700CEB",
                    letterSpacing: "0.1em",
                    flexShrink: 0,
                    paddingTop: 4,
                  }}
                >
                  {n}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#0f0a1e",
                      margin: "0 0 8px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.75,
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    {text}
                  </p>
                </div>
              </motion.div>
            ))}
            <div style={{ borderTop: "1px solid #e5e0d8" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanyMission;
