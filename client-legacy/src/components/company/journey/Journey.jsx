import React from "react";
import { motion } from "framer-motion";

const milestones = [
  {
    year: "2018",
    event: "Founded in Lagos",
    detail:
      "Kemchuta Homes Limited established with a vision to democratise land ownership across Nigeria.",
  },
  {
    year: "2020",
    event: "First Estate Launched",
    detail:
      "Delivered our inaugural estate project in Ibeju-Lekki, setting the benchmark for quality and transparency.",
  },
  {
    year: "2022",
    event: "Asaba Expansion",
    detail:
      "Opened our Delta State office, bringing affordable real estate to South-South Nigeria.",
  },
  {
    year: "2023",
    event: "Buy2Sell Scheme",
    detail:
      "Launched the pioneering Buy2Sell land bank investment scheme — up to 75% ROI over 18 months.",
  },
  {
    year: "2024",
    event: "Digital Portal",
    detail:
      "Released the client portal — subscriptions, documents, and investment tracking all in one place.",
  },
  {
    year: "Now",
    event: "1000+ Subscribers",
    detail:
      "Over 1000 families on their journey to land ownership across our growing portfolio of estates.",
  },
];

function Journey() {
  return (
    <section
      className="w-full"
      style={{
        background: "#faf9f6",
        overflow: "hidden",
        borderTop: "1px solid #e5e0d8",
      }}
    >
      <div className="w-11/12 mx-auto py-20 md:py-32">
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(32px, 6vw, 80px)",
            marginBottom: 72,
            alignItems: "end",
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
              Our History
            </p>
            <h3
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "#0f0a1e",
                margin: 0,
              }}
            >
              Our
              <br />
              <span style={{ color: "#700CEB", fontStyle: "italic" }}>
                Journey.
              </span>
            </h3>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              lineHeight: 1.8,
              color: "#4b5563",
              margin: 0,
            }}
          >
            Founded in 2018, Kemchuta Homes has grown from a modest local firm
            into a prominent industry leader. Our journey is defined by a
            steadfast commitment to excellence, passion for innovation, and
            dedication to every client we serve.
          </motion.p>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 0,
              bottom: 0,
              width: 1,
              background:
                "linear-gradient(to bottom, #700CEB, rgba(112,12,235,0.1))",
            }}
            className="hidden md:block"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {milestones.map(({ year, event, detail }, i) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  delay: i * 0.07,
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "96px 1fr",
                  gap: 32,
                  padding: "28px 0",
                  borderBottom: "1px solid #e5e0d8",
                  alignItems: "start",
                  position: "relative",
                }}
              >
                {/* Year + dot */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 4,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: year === "Now" ? "#700CEB" : "#0f0a1e",
                      border:
                        year === "Now"
                          ? "3px solid rgba(112,12,235,0.3)"
                          : "3px solid #faf9f6",
                      outline: `2px solid ${year === "Now" ? "#700CEB" : "#e5e0d8"}`,
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  />
                  <span
                    style={{
                      fontSize: year === "Now" ? "0.9rem" : "0.85rem",
                      fontWeight: 900,
                      color: year === "Now" ? "#700CEB" : "#9ca3af",
                      letterSpacing: year === "Now" ? "0.05em" : "0",
                    }}
                  >
                    {year}
                  </span>
                </div>

                {/* Event + detail */}
                <div style={{ paddingTop: 2 }}>
                  <p
                    style={{
                      fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
                      fontWeight: 800,
                      color: "#0f0a1e",
                      letterSpacing: "-0.02em",
                      margin: "0 0 6px",
                    }}
                  >
                    {event}
                  </p>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.75,
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    {detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{
            marginTop: 72,
            padding: "40px 48px",
            background: "#0f0a1e",
            borderRadius: 20,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
              margin: "0 0 16px",
            }}
          >
            The best chapter of our story
            <br />
            <span style={{ color: "#700CEB", fontStyle: "italic" }}>
              hasn't been written yet.
            </span>
          </p>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
            }}
          >
            Join thousands of Nigerians building their legacy with Kemchuta
            Homes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default Journey;
