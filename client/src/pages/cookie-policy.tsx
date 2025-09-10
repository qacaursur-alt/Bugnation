import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Cookie Policy</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
                <p className="mb-4">
                  Cookies are small text files that are placed on your computer or mobile device when 
                  you visit our website. They help us provide you with a better experience by remembering 
                  your preferences and enabling certain functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
                <p className="mb-4">We use cookies for several purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To remember your login status and preferences</li>
                  <li>To track your course progress and learning analytics</li>
                  <li>To provide personalized content and recommendations</li>
                  <li>To analyze website traffic and usage patterns</li>
                  <li>To improve our website functionality and user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                    <p className="mb-2">
                      These cookies are necessary for the website to function properly. They enable basic 
                      functions like page navigation, access to secure areas, and user authentication.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Examples:</strong> Session cookies, authentication tokens, security cookies
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Performance Cookies</h3>
                    <p className="mb-2">
                      These cookies collect information about how visitors use our website, such as which 
                      pages are visited most often and if users get error messages.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Examples:</strong> Google Analytics, page load times, user journey tracking
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                    <p className="mb-2">
                      These cookies enable the website to provide enhanced functionality and personalization, 
                      such as remembering your preferences and course progress.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Examples:</strong> Language preferences, course bookmarks, progress tracking
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
                    <p className="mb-2">
                      These cookies are used to track visitors across websites to display relevant and 
                      engaging advertisements.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Examples:</strong> Social media pixels, advertising networks, retargeting
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
                <p className="mb-4">
                  We may use third-party services that set their own cookies. These include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                  <li><strong>Payment Processors:</strong> For secure payment processing</li>
                  <li><strong>Social Media:</strong> For social sharing and login functionality</li>
                  <li><strong>Video Platforms:</strong> For course video delivery and streaming</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
                <p className="mb-4">
                  You can control and manage cookies in several ways:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use your browser settings to block or delete cookies</li>
                  <li>Use our cookie consent banner to choose which cookies to accept</li>
                  <li>Opt-out of specific third-party cookies through their respective websites</li>
                  <li>Use browser extensions that block tracking cookies</li>
                </ul>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">Browser Settings:</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Impact of Disabling Cookies</h2>
                <p className="mb-4">
                  If you choose to disable cookies, some features of our website may not function properly:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may need to log in repeatedly</li>
                  <li>Your course progress may not be saved</li>
                  <li>Personalized content may not be available</li>
                  <li>Some interactive features may not work</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Cookie Retention</h2>
                <p className="mb-4">
                  Different cookies have different retention periods:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 30 days to 2 years)</li>
                  <li><strong>Authentication Cookies:</strong> Usually expire after 30 days of inactivity</li>
                  <li><strong>Analytics Cookies:</strong> Typically retained for 2 years</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Updates to This Policy</h2>
                <p className="mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons. We will notify you of any 
                  significant changes by posting the updated policy on our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@testacademy.com</p>
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
