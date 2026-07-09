import React from "react";
import { motion } from "framer-motion";
import { ourPeople } from "../../../../data";

function CompanyPeople() {
  return (
    <section
      className="w-full"
      style={{ background: "#faf9f6", overflow: "hidden" }}
    >
      <div className="w-11/12 mx-auto py-20 md:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          style={{ marginBottom: 80 }}
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
            The Team
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
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
                People.
              </span>
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.95rem",
                maxWidth: 340,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              A community of exceptional individuals with the skills, passion,
              and dedication to build something truly extraordinary.
            </p>
          </div>
        </motion.div>

        {/* People list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ourPeople.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.05,
              }}
              style={{
                borderTop: "1px solid #e5e0d8",
                paddingTop: 48,
                paddingBottom: 48,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "clamp(32px, 6vw, 80px)",
                  alignItems: "center",
                }}
              >
                {/* Person number + name — left column */}
                <div>
                  {/* Index number */}
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#bbb",
                      letterSpacing: "0.12em",
                      marginBottom: 16,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  {/* Image */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      borderRadius: 14,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={person.img}
                      alt={person.name}
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                      }}
                    />
                    {/* Purple hover wash */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(112,12,235,0.3) 0%, transparent 50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Text — right column */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                      fontWeight: 900,
                      color: "#0f0a1e",
                      letterSpacing: "-0.04em",
                      lineHeight: 1.05,
                      margin: "0 0 6px",
                    }}
                  >
                    {person.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#700CEB",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      margin: "0 0 24px",
                    }}
                  >
                    {person.role}
                  </p>
                  <div
                    style={{
                      width: 40,
                      height: 2,
                      background: "#700CEB",
                      marginBottom: 24,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "1rem",
                      lineHeight: 1.85,
                      color: "#4b5563",
                      margin: 0,
                    }}
                  >
                    {person.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          <div style={{ borderTop: "1px solid #e5e0d8" }} />
        </div>
      </div>
    </section>
  );
}

export default CompanyPeople;
