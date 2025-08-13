import React, { useEffect, useState } from "react";
import axios from "axios";

let scrapedCache = null;

export default function Register() {
  const [fields, setFields] = useState([]);
  const [consent, setConsent] = useState(null);
  const [dropdowns, setDropdowns] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scrapedCache) {
      setFields(scrapedCache.step1);
      setConsent(scrapedCache.consent);
      setDropdowns(scrapedCache.dropdowns || []);
      initializeForm(scrapedCache);
      setLoading(false);
    } else {
      axios
        .get("/api/v1/scrape/registrationScrape")
        .then((res) => {
          scrapedCache = res.data;
          setFields(res.data.step1);
          setConsent(res.data.consent);
          setDropdowns(res.data.dropdowns || []);
          initializeForm(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("API error:", err);
          setLoading(false);
        });
    }
    // eslint-disable-next-line
  }, []);

  const initializeForm = (data) => {
    const initialForm = {};
    data.step1.forEach((f) => {
      initialForm[f.name] = "";
    });
    if (data.consent) {
      initialForm[data.consent.name] = data.consent.checked || false;
    }
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // If consent checkbox exists, enforce it
  if (consent && !form[consent.name]) {
    alert("You must agree to the consent checkbox before registering.");
    return;
  }

  const payload = {
    AdharNumber: form["ctl00$ContentPlaceHolder1$txtadharno"],
    RegisteredName: form["ctl00$ContentPlaceHolder1$txtownername"],
  };

  try {
    const res = await axios.post("/api/v1/users/register", payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("User registered:", res.data);
    alert("Registration successful!");
  } catch (err) {
    console.error("Registration error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Registration failed");
  }
};

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></span>
      </div>
    );

  return (
    <div>
      {/* Navigation Bar */}
      {dropdowns.length > 0 && (
        <nav className="bg-blue-700 text-white px-4 py-3 shadow sticky top-0 z-50">
          <ul className="flex flex-wrap gap-6">
            {dropdowns.map((dropdown, idx) => (
              <li key={idx} className="relative group">
                <span className="cursor-pointer font-semibold">
                  {dropdown.label}
                </span>
                {dropdown.subItems.length > 0 && (
                  <ul className="absolute left-0 mt-2 bg-white text-black rounded shadow-lg hidden group-hover:block z-10 min-w-[200px] border border-transparent group-hover:border-black transition-all duration-200 p-2">
                    {dropdown.subItems.map((item, subIdx) => (
                      <li key={subIdx}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 hover:bg-blue-100"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Registration Form */}
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-4xl border rounded-lg shadow bg-white">
          <div className="bg-blue-600 text-white px-4 py-2 font-semibold rounded-t-lg">
            Aadhaar Verification With OTP
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields
                .filter(
                  (field) =>
                    field.name === "ctl00$ContentPlaceHolder1$txtadharno" ||
                    field.name === "ctl00$ContentPlaceHolder1$txtownername"
                )
                .map((field) => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label
                      htmlFor={field.id}
                      className="text-sm font-semibold text-gray-800"
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      maxLength={field.maxlength || undefined}
                      autoComplete={field.autocomplete}
                      required={field.required}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <span className="text-red-500 text-xs font-medium">
                      Required
                    </span>
                  </div>
                ))}
            </div>

            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Aadhaar number shall be required for Udyam Registration.</li>
              <li>
                The Aadhaar number shall be of the proprietor in the case of a
                proprietorship firm, of the managing partner in the case of a
                partnership firm and of a karta in the case of a Hindu Undivided
                Family (HUF).
              </li>
              <li>
                In case of a Company or a Limited Liability Partnership or a
                Cooperative Society or a Society or a Trust, the organisation or
                its authorised signatory shall provide its GSTIN (As per
                applicability of CGST Act 2017 and as notified by the ministry
                of MSME{" "}
                <a
                  href="https://egazette.nic.in/WriteReadData/2021/225551.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  vide S.O. 1055(E) dated 05th March 2021
                </a>
                ) and PAN along with its Aadhaar number.
              </li>
            </ul>

            {consent && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={consent.id}
                  name={consent.name}
                  checked={form[consent.name]}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                />
                <label htmlFor={consent.id} className="text-xs text-gray-700">
                  {consent.text}
                </label>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Validate & Generate OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
