import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Bhulia.com",
  description: "Privacy Policy for Bhulia.com - Original Sambalpuri Saree & Handloom from Odisha.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen bg-[#051815] text-gray-300 font-sans">
      <Header />
      
      <div className="pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#C5A059] mb-6">Privacy Policy</h1>
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-12">Last Updated: August 2026</p>

        <div className="space-y-12 text-gray-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              At Bhulia Hub, we collect information to provide better services to our users and ensure the authenticity of our Sambalpuri handloom marketplace. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong>Personal Information:</strong> Name, email address, and contact details provided when you register as a weaver, reseller, or buyer.</li>
              <li><strong>Usage Data:</strong> Information about how you use our platform, your IP address, browser type, and operating system.</li>
              <li><strong>Cookies & Tracking:</strong> We use cookies and similar tracking technologies (including Google Analytics and Google AdSense) to track activity on our platform and hold certain information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the collected data for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>To provide, maintain, and improve our marketplace services.</li>
              <li>To manage your account, process transactions, and ensure secure logistics (e.g., Secure BVC Armored Transit).</li>
              <li>To communicate with you regarding order updates, live silk rates, and support messages.</li>
              <li>To display personalized advertisements via third-party vendors, including Google AdSense.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              3. Google AdSense & Advertising Cookies
            </h2>
            <p className="mb-4">
              Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.
            </p>
            <p className="mb-4">
              Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
            </p>
            <p>
              Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#C5A059] hover:underline">Ads Settings</a>. Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" className="text-[#C5A059] hover:underline">www.aboutads.info</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              4. Third-Party Services
            </h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              5. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our 24/7 Concierge Support at: <br/><br/>
              <strong>Email:</strong> admin@shyamdash.com <br/>
            </p>
          </section>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
