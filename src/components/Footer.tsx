"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/siteConfig";
import { API_URL } from "@/lib/api";

const defaults = {
  footer_copyright:        siteConfig.copyright,
  contact_phone:           siteConfig.contact.phone,
  contact_email:           siteConfig.contact.email,
  contact_address_line1:   siteConfig.contact.addressLine1,
  contact_address_line2:   siteConfig.contact.addressLine2,
  social_instagram:        "",
  social_facebook:         "",
};

export default function Footer() {
  const [data, setData] = useState(defaults);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((settings: Record<string, string>) => {
        if (settings && Object.keys(settings).length > 0) {
          setData((prev) => ({ ...prev, ...settings }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-stone-200 py-10 px-6 md:px-12 text-stone-500 font-light text-xs tracking-wide">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
        
        <div className="col-span-2 md:col-span-1 flex items-start">
          <span>
            <span>&copy;</span>{" "}
            {data.footer_copyright.replace(/^©\s?/, "")}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {data.contact_phone && (
            <a
              href={`tel:${data.contact_phone.replace(/\s/g, "")}`}
              className="hover:text-stone-900 transition-colors uppercase"
            >
              {data.contact_phone}
            </a>
          )}
          {data.contact_email && (
            <a
              href={`mailto:${data.contact_email}`}
              className="hover:text-stone-900 transition-colors uppercase break-all"
            >
              {data.contact_email}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {data.contact_address_line1 && (
            <span className="uppercase">{data.contact_address_line1}</span>
          )}
          {data.contact_address_line2 && (
            <span className="uppercase">{data.contact_address_line2}</span>
          )}
        </div>

        {(data.social_instagram || data.social_facebook) && (
          <div className="flex flex-col gap-1.5">
            {data.social_instagram && (
              <a
                href={data.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 transition-colors uppercase"
              >
                Instagram
              </a>
            )}
            {data.social_facebook && (
              <a
                href={data.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 transition-colors uppercase"
              >
                Facebook
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
