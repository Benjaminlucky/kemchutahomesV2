import React from "react";
import { motion } from "framer-motion";
import { mainLink, Social, support } from "../../../data";
import { Link } from "react-router-dom";

function Footer() {
  const date = new Date();
  const fullYear = date.getFullYear();

  return (
    <footer>
      <div className="footer__wrapper w-full bg-customBlack-900">
        <div className="footer__content w-10/12 mx-auto py-24 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Section Animation */}
          <motion.div
            className="footers__left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="footers">
              <div className="top">
                <img
                  src="/assets/logoWhite.png"
                  alt="Kemchuta Homes Limited White Logo"
                />
              </div>
              <div className="bottom py-8 text-justify text-gray-500">
                <p>
                  At Kemchuta Homes, we’re more than a real estate business –
                  we’re your trusted partner in turning your property ownership
                  dreams into reality. We know that real estate is not just an
                  investment; it’s about building your future, securing your
                  legacy, and finding the perfect place to call home. Let’s
                  create something extraordinary, together.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Section Animation */}
          <motion.div
            className="footer__right flex gap-4 md:gap-16 items-start"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {[
              { title: "Quick Links", links: mainLink },
              { title: "Support", links: support },
              { title: "Social Links", links: Social },
            ].map((section, index) => (
              <motion.div
                key={index}
                className="footers"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + index * 0.2 }}
              >
                <div className="content">
                  <div className="title text-customPurple-500 font-bold pb-8">
                    <h4>{section.title}</h4>
                  </div>
                  <div className="links">
                    {section.links.map((link, linkIndex) => (
                      <div
                        className="link text-gray-600 md:py-1"
                        key={linkIndex}
                      >
                        <Link to={link.link}>{link.name}</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Section Animation */}
        <motion.div
          className="bottom bg-customPurple-900 w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="bottom__wrapper w-10/12 mx-auto py-3 flex flex-col text-center md:text-left md:flex-row justify-between">
            <div className="left text-gray-400 text-[11px] md:text-lg font-bold">
              <p>
                &copy; Kemchuta Homes Limited | All Rights Reserved {fullYear}
              </p>
            </div>
            <div className="right text-gray-600 text-[11px] font-semibold">
              <p>Developed by Inspireme Media Networks</p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
