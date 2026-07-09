import React from "react";
import { motion } from "framer-motion";

function CompanyVision() {
  const stats = [
    { val: "8+", label: "Years in Operation" },
    { val: "1000+", label: "Plots Delivered" },
    { val: "15+", label: "Active Estates" },
  ];

  return (
    <section
      className="w-full"
      style={{ background: "#0f0a1e", overflow: "hidden" }}
    >
      <div className="w-11/12 mx-auto py-20 md:py-32">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 48,
          }}
        >
          <div style={{ width: 32, height: 2, background: "#700CEB" }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#700CEB",
            }}
          >
            Our Vision
          </span>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(40px, 8vw, 100px)",
            alignItems: "center",
          }}
        >
          {/* Image — with purple border accent */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative" }}
          >
            {/* Purple border behind image — offset */}
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                right: -16,
                bottom: -16,
                border: "2px solid #700CEB",
                borderRadius: 16,
                opacity: 0.5,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <img
                src="./assets/visionBG.jpg"
                alt="Kemchuta Homes Vision"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(112,12,235,0.2) 0%, transparent 60%)",
                }}
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <h3
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: "#fff",
                margin: "0 0 28px",
              }}
            >
              A Future
              <br />
              <span style={{ color: "#700CEB", fontStyle: "italic" }}>
                Worth Building.
              </span>
            </h3>

            <p
              style={{
                fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 40,
              }}
            >
              We envision a future where every individual's dream of owning
              their ideal home is realized. Our goal is to be a leading force in
              real estate investment and development, setting new industry
              standards and transforming properties into thriving, vibrant
              communities that inspire and elevate.
            </p>

            {/* Stat strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {stats.map(({ val, label }) => (
                <div
                  key={label}
                  style={{
                    padding: "18px 16px",
                    background: "#0f0a1e",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      fontWeight: 900,
                      color: "#700CEB",
                      letterSpacing: "-0.04em",
                      margin: "0 0 4px",
                    }}
                  >
                    {val}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.4)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CompanyVision;
