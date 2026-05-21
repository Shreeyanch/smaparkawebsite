import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
            Welcome to <span className="font-semibold">SAMPARKA</span>. We
            respect your privacy and are committed to protecting the personal
            information you share with us. This policy explains how we collect,
            use, and safeguard your data.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            1. Information We Collect
          </h2>
          <p>
            We may collect your name, contact details, store details, and
            communication preferences when you use our platform or subscribe to
            our loyalty and messaging services.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            2. How We Use Information
          </h2>
          <p>
            The information we collect is used to deliver and improve our
            services, including sending notifications, promotional messages, and
            customer engagement updates as authorized by our users and clients.
          </p>

          <h2 className="text-2xl font-semibold mt-8">3. Data Sharing</h2>
          <p>
            We do not sell or share your personal information with third parties
            except when required by law or when necessary to provide essential
            services through trusted partners (e.g., email or WhatsApp
            providers).
          </p>

          <h2 className="text-2xl font-semibold mt-8">4. Data Security</h2>
          <p>
            We use modern security measures and cloud infrastructure to protect
            your information against unauthorized access, loss, or misuse.
          </p>

          <h2 className="text-2xl font-semibold mt-8">5. Your Rights</h2>
          <p>
            You can request access, correction, or deletion of your data at any
            time by contacting us at{" "}
            <a
              href="mailto:hello@samparka.co"
              className="text-blue-600 hover:underline"
            >
              hello@samparka.co
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-8">6. Updates</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of our
            services after updates constitutes your agreement to the revised
            terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8">7. Contact</h2>
          <p>
            For any questions or concerns about our privacy practices, contact
            us at:
          </p>
          <div className="border-l-4 border-blue-600 pl-4 mt-2">
            <p className="font-medium">SAMPARKA</p>
            <p>Email: hello@samparka.co</p>
            <p>Website: https://samparka.co</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          © {new Date().getFullYear()} SAMPARKA. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
