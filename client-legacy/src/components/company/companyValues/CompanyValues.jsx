import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { values } from "../../../../data";

function CompanyValues() {
  const [active, setActive] = useState(0);

  return (
    <section
      className="w-full"
      style={{ background: "#0f0a1e", overflow: "hidden" }}
    >
      <div className="w-11/12 mx-auto py-20 md:py-32">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 64,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: 32,
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
                margin: "0 0 12px",
              }}
            >
              Our Values
            </p>
            <h3
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "#fff",
                margin: 0,
              }}
            >
              We Are
              <br />
              <span style={{ color: "#700CEB", fontStyle: "italic" }}>
                Kemchuta.
              </span>
            </h3>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.95rem",
              maxWidth: 360,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Every letter in our name is a value we live by. These are not
            aspirations — they are commitments.
          </motion.p>
        </div>

        {/* Values list — horizontal tab + detail panel layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 48,
          }}
        >
          {/* Letter tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {values.map((value, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 0",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    flexShrink: 0,
                    background:
                      active === i ? "#700CEB" : "rgba(255,255,255,0.06)",
                    color: active === i ? "#fff" : "rgba(255,255,255,0.4)",
                    transition: "all 0.3s",
                  }}
                >
                  {value.letter}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: active === i ? "#fff" : "rgba(255,255,255,0.4)",
                    letterSpacing: "-0.01em",
                    transition: "color 0.2s",
                  }}
                >
                  {value.title}
                </span>
                {active === i && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#700CEB",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
          </motion.div>

          {/* Active value detail panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: "rgba(112,12,235,0.08)",
                  border: "1px solid rgba(112,12,235,0.2)",
                  borderRadius: 20,
                  padding: "clamp(24px, 4vw, 48px)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(4rem, 10vw, 8rem)",
                    fontWeight: 900,
                    color: "rgba(112,12,235,0.15)",
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    marginBottom: 16,
                  }}
                >
                  {values[active]?.letter}
                </div>
                <h4
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    margin: "0 0 16px",
                  }}
                >
                  {values[active]?.title}
                </h4>
                <p
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.6)",
                    margin: 0,
                  }}
                >
                  {values[active]?.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CompanyValues;
