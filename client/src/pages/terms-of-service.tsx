import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using TestAcademy ("the Service"), you accept and agree to be bound 
                  by the terms and provision of this agreement. If you do not agree to abide by the 
                  above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="mb-4">
                  TestAcademy provides online educational courses, training materials, and certification 
                  programs in software testing and related fields. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Self-paced online courses</li>
                  <li>Live instructor-led sessions</li>
                  <li>Study materials and resources</li>
                  <li>Quizzes and assessments</li>
                  <li>Certificates of completion</li>
                  <li>Community forums and support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <p className="mb-4">
                  To access certain features of the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Course Enrollment and Payment</h2>
                <p className="mb-4">
                  Course fees are clearly displayed before enrollment. Payment terms include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>Access to courses is granted upon successful payment</li>
                  <li>Course content may be updated without notice</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
                <p className="mb-4">
                  All content, materials, and intellectual property on the Service are owned by 
                  TestAcademy or our licensors. You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Copy, distribute, or modify course materials</li>
                  <li>Share your account credentials with others</li>
                  <li>Use content for commercial purposes without permission</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
                <p className="mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Upload malicious code or viruses</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
                <p className="mb-4">
                  Your privacy is important to us. Please review our Privacy Policy to understand 
                  how we collect, use, and protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>
                <p className="mb-4">
                  The Service is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Uninterrupted or error-free service</li>
                  <li>Specific learning outcomes or job placement</li>
                  <li>Compatibility with all devices or browsers</li>
                  <li>Accuracy of all course content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your account at any time for violation of these terms. 
                  You may terminate your account at any time by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these terms at any time. Continued use of the Service 
                  after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@testacademy.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Education Street, Learning City, LC 12345</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
