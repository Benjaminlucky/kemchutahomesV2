"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { mainLink, social, support, type NavLink } from "@/lib/navLinks";

export default function Footer() {
  const fullYear = new Date().getFullYear();

  const sections: { title: string; links: NavLink[] }[] = [
    { title: "Quick Links", links: mainLink },
    { title: "Support", links: support },
    { title: "Social Links", links: social },
  ];

  return (
    <footer>
      <div className="w-full bg-customBlack-900">
        <div className="mx-auto grid w-10/12 grid-cols-1 gap-12 py-24 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Image
              src="/assets/logoWhite.png"
              alt="Kemchuta Homes Limited"
              width={160}
              height={48}
              style={{ width: "auto", height: "auto" }}
            />
            <div className="py-8 text-justify text-gray-500">
              <p>
                At Kemchuta Homes, we&rsquo;re more than a real estate
                business &ndash; we&rsquo;re your trusted partner in turning
                your property ownership dreams into reality. We know that
                real estate is not just an investment; it&rsquo;s about
                building your future, securing your legacy, and finding the
                perfect place to call home. Let&rsquo;s create something
                extraordinary, together.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start gap-4 md:gap-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + index * 0.2 }}
              >
                <h4 className="pb-8 font-bold text-customPurple-500">
                  {section.title}
                </h4>
                <div>
                  {section.links.map((link, linkIndex) => (
                    <div
                      className="text-gray-600 md:py-1"
                      key={`${link.name}-${linkIndex}`}
                    >
                      <Link href={link.link}>{link.name}</Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="w-full bg-customPurple-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="mx-auto flex w-10/12 flex-col justify-between py-3 text-center md:flex-row md:text-left">
            <p className="text-[11px] font-bold text-gray-400 md:text-lg">
              &copy; Kemchuta Homes Limited | All Rights Reserved {fullYear}
            </p>
            <p className="text-[11px] font-semibold text-gray-600">
              Developed by Inspireme Media Networks
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
