import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Package,
  Pulse,
  TestTube,
  Bed,
  Shield,
  CheckCircle,
  Star,
  Globe,
  WifiHigh,
  Database,
  Clock,
  Medal,
  Lightning,
  PhoneCall,
  Envelope,
  ArrowRight,
  Download,
  Play
} from '@phosphor-icons/react'

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Complete patient records with vaccination tracking and chronic conditions monitoring'
    },
    {
      icon: Calendar,
      title: 'Appointment Scheduling',
      description: 'Smart scheduling with doctor availability and automated SMS reminders'
    },
    {
      icon: FileText,
      title: 'Medical Records',
      description: 'Electronic health records with consultation notes and prescription management'
    },
    {
      icon: CreditCard,
      title: 'Billing & Insurance',
      description: 'Automated billing with insurance claim processing and financial reporting'
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Medicine and medical supplies tracking with expiry date monitoring'
    },
    {
      icon: TestTube,
      title: 'Laboratory Management',
      description: 'Test ordering, result tracking, and comprehensive report generation'
    },
    {
      icon: Bed,
      title: 'Bed Management',
      description: 'Real-time bed availability and patient admission tracking'
    },
    {
      icon: Shield,
      title: 'Role-Based Security',
      description: 'Multi-level access control for different hospital staff roles'
    }
  ]

  const benefits = [
    {
      icon: WifiHigh,
      title: 'Offline-First Design',
      description: 'Works without internet connection with automatic sync when online'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Built-in support for Hindi, English, and regional languages'
    },
    {
      icon: Database,
      title: 'Secure Database',
      description: 'MySQL database with encrypted data storage and HIPAA compliance'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Round-the-clock system availability with reliable uptime'
    }
  ]

  const testimonials = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Chief Medical Officer',
      hospital: 'Rural Health Center, Rajasthan',
      content: 'MedCare Rural has transformed our hospital operations. The offline capability is a game-changer for our remote location.',
      rating: 5
    },
    {
      name: 'Sister Priya Sharma',
      role: 'Head Nurse',
      hospital: 'Community Hospital, Bihar',
      content: 'The user-friendly interface made it easy for our staff to adapt quickly. Patient management has never been this efficient.',
      rating: 5
    },
    {
      name: 'Mr. Amit Patel',
      role: 'Hospital Administrator',
      hospital: 'District Hospital, Gujarat',
      content: 'The billing and insurance features have significantly reduced our administrative overhead and improved revenue collection.',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹25,000',
      period: 'One-time',
      description: 'Perfect for small clinics and healthcare centers',
      features: [
        'Up to 50 patients',
        'Basic appointment scheduling',
        'Simple billing system',
        'Patient records management',
        'Email support',
        'Free installation'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '₹40,000',
      period: 'One-time',
      description: 'Ideal for medium-sized hospitals and multi-specialty clinics',
      features: [
        'Unlimited patients',
        'Advanced scheduling',
        'Complete billing & insurance',
        'Lab management system',
        'Inventory tracking',
        'SMS notifications',
        'Priority support',
        'Staff training included'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Quote',
      description: 'For large hospitals with specific requirements',
      features: [
        'All Professional features',
        'Custom integrations',
        'Multi-location support',
        'Advanced analytics',
        'Custom reporting',
        '24/7 phone support',
        'On-site installation',
        'Dedicated account manager'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-white text-blue-600 rounded-2xl mr-4">
                <Heart className="w-10 h-10" weight="fill" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold mb-2">MedCare Rural</h1>
                <p className="text-xl opacity-90">Hospital Management System</p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-2xl mb-4 font-light">
                Complete Healthcare Management Solution for Rural Hospitals
              </p>
              <p className="text-lg opacity-90">
                Designed specifically for small and medium hospitals in rural India with offline-first architecture,
                multi-language support, and comprehensive healthcare management features.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Lightning className="w-4 h-4 mr-2" />
                Offline-First Design
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Database className="w-4 h-4 mr-2" />
                MySQL Database
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                HIPAA Compliant
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Medal className="w-4 h-4 mr-2" />
                Premium Software
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                <Link to="/login">
                  <Download className="w-5 h-5 mr-2" />
                  Get Demo Access
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo Video
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Healthcare Management</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run a modern hospital efficiently, from patient registration to billing and inventory management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MedCare Rural?</h2>
            <p className="text-xl text-gray-600">Built specifically for the unique challenges of rural healthcare</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-xl text-gray-600">See what hospital staff are saying about MedCare Rural</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400" weight="fill" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600">{testimonial.hospital}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">One-time purchase with no recurring fees. Own your software forever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-0 shadow-lg ${plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`} size="lg" asChild>
                    <Link to="/login">
                      {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Hospital?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of hospitals already using MedCare Rural to improve patient care and operational efficiency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
              <Link to="/login">
                <PhoneCall className="w-5 h-5 mr-2" />
                Schedule Demo Call
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              <Link to="/login">
                <Envelope className="w-5 h-5 mr-2" />
                Request Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 text-blue-400 mr-2" weight="fill" />
                <span className="text-xl font-bold">MedCare Rural</span>
              </div>
              <p className="text-gray-400">
                Complete hospital management solution designed for rural healthcare facilities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white">Demo</a></li>
                <li><a href="#documentation" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white">Help Center</a></li>
                <li><a href="#training" className="hover:text-white">Training</a></li>
                <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="#maintenance" className="hover:text-white">Maintenance Plans</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>📧 sales@medcare-rural.com</p>
                <p>📞 +91-XXXX-XXXXXX</p>
                <p>🕒 9 AM - 6 PM IST</p>
                <p>📍 India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 MedCare Rural. All rights reserved. This is premium commercial software.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}