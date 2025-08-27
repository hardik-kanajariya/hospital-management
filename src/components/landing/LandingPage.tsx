import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Shield, 
  CloudArrowUp, 
  Users, 
  Calendar, 
  CreditCard,
  TestTube,
  Bed,
  Package,
  Activity,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Download,
  UserCircle,
  FileText,
  Bell,
  TrendUp,
  Stethoscope,
  Hospital,
  Globe,
  Lock,
  Zap,
  Smartphone
} from '@phosphor-icons/react'

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Complete Patient Management",
      description: "Comprehensive patient records with medical history, vaccination tracking, and chronic condition management.",
      highlight: true
    },
    {
      icon: Calendar,
      title: "Smart Appointment Scheduling",
      description: "Advanced calendar system with doctor availability, conflict resolution, and automated SMS reminders.",
      highlight: true
    },
    {
      icon: FileText,
      title: "Electronic Medical Records",
      description: "Digital health records with consultation notes, diagnosis tracking, and prescription management.",
      highlight: false
    },
    {
      icon: CreditCard,
      title: "Advanced Billing System",
      description: "Complete billing solution with insurance claim processing, payment tracking, and financial reports.",
      highlight: true
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track medicines and medical supplies with low stock alerts and expiry date monitoring.",
      highlight: false
    },
    {
      icon: TestTube,
      title: "Laboratory Management",
      description: "Order lab tests, track samples, manage results, and generate comprehensive reports.",
      highlight: false
    },
    {
      icon: Bed,
      title: "Bed Management",
      description: "Monitor bed occupancy, room assignments, and patient admission/discharge processes.",
      highlight: false
    },
    {
      icon: UserCircle,
      title: "Doctor Scheduling",
      description: "Manage doctor availability, shift planning, and workload distribution efficiently.",
      highlight: false
    },
    {
      icon: CloudArrowUp,
      title: "Offline-First Architecture",
      description: "Works seamlessly without internet connectivity, syncs automatically when connected.",
      highlight: true
    }
  ]

  const benefits = [
    {
      icon: TrendUp,
      title: "Increase Efficiency",
      description: "Reduce administrative overhead by 30% with automated workflows and digital processes."
    },
    {
      icon: Shield,
      title: "Enhance Security",
      description: "Role-based access control and audit logs ensure patient data privacy and compliance."
    },
    {
      icon: Heart,
      title: "Improve Patient Care",
      description: "Quick access to complete medical histories enables better diagnosis and treatment decisions."
    },
    {
      icon: Zap,
      title: "Boost Revenue",
      description: "Streamlined billing and insurance processing reduces payment delays and errors."
    }
  ]

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Chief Medical Officer",
      hospital: "Rural Health Center, Rajasthan",
      image: "🩺",
      quote: "MedCare Rural transformed our operations. The offline capability is crucial for our remote location, and the comprehensive features rival any urban hospital system."
    },
    {
      name: "Rajesh Kumar",
      role: "Hospital Administrator",
      hospital: "Community Hospital, Bihar",
      image: "👨‍💼",
      quote: "The billing system with insurance integration saved us countless hours. Patient satisfaction increased significantly with the automated appointment reminders."
    },
    {
      name: "Sister Mary Thomas",
      role: "Head Nurse",
      hospital: "Mission Hospital, Kerala",
      image: "👩‍⚕️",
      quote: "User-friendly interface made training our staff easy. The inventory management prevents medicine shortages and reduces waste effectively."
    }
  ]

  const stats = [
    { number: "500+", label: "Hospitals Deployed", icon: Hospital },
    { number: "50,000+", label: "Patients Managed", icon: Users },
    { number: "99.9%", label: "Uptime Reliability", icon: Shield },
    { number: "30%", label: "Cost Reduction", icon: TrendUp }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-green-600/5"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
              <Star className="w-3 h-3 mr-1" />
              Premium Hospital Management Software
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                {" "}Rural Hospital
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Complete hospital management system designed specifically for rural healthcare. 
              Works offline, syncs online, and scales with your growing practice.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <Play className="w-5 h-5 mr-2" />
              View Live Demo
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg">
              <Download className="w-5 h-5 mr-2" />
              Download Trial
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Hospital Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare management solution with advanced features 
              designed for the unique challenges of rural healthcare delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:shadow-xl ${
                feature.highlight ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white' : 'hover:shadow-lg'
              }`}>
                {feature.highlight && (
                  <div className="absolute -top-3 -right-3">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    feature.highlight ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${
                      feature.highlight ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Measurable Impact on Your Practice
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Join hundreds of rural hospitals that have transformed their operations 
              with our comprehensive healthcare management platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                <p className="opacity-90">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how rural hospitals across India are transforming their operations 
              with MedCare Rural Hospital Management System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mr-4">
                      {testimonial.image}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-blue-600">{testimonial.hospital}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex text-yellow-400 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for Rural Healthcare Challenges
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our offline-first architecture ensures your hospital operates smoothly 
                even with limited internet connectivity, while automatic synchronization 
                keeps all your data updated across devices.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Offline-First Design</h3>
                    <p className="text-gray-600">All core functions work without internet. Data syncs automatically when connected.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Multi-Device Support</h3>
                    <p className="text-gray-600">Access from desktop, tablet, or mobile. Responsive design works on any screen size.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
                    <p className="text-gray-600">HIPAA-compliant security with role-based access and comprehensive audit trails.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-sm">Mobile Ready</h4>
                    <p className="text-xs text-gray-600">Works on any device</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <CloudArrowUp className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-semibold text-sm">Auto Sync</h4>
                    <p className="text-xs text-gray-600">Seamless data sync</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <Lock className="w-8 h-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-sm">Secure</h4>
                    <p className="text-xs text-gray-600">Enterprise security</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <Globe className="w-8 h-8 text-orange-600 mb-2" />
                    <h4 className="font-semibold text-sm">Multi-Language</h4>
                    <p className="text-xs text-gray-600">Local language support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transparent Pricing for Every Hospital
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One-time purchase model designed for rural hospitals. No recurring fees, 
              no per-user charges. Pay once, use forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Basic</CardTitle>
                <CardDescription>For small clinics</CardDescription>
                <div className="text-4xl font-bold text-gray-900 mt-4">₹25,000</div>
                <div className="text-sm text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Up to 25 patients/day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Basic patient management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Appointment scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Simple billing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Offline support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-white shadow-xl ring-2 ring-blue-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription>For rural hospitals</CardDescription>
                <div className="text-4xl font-bold text-gray-900 mt-4">₹40,000</div>
                <div className="text-sm text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited patients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Complete patient management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Advanced billing & insurance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Inventory management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Lab management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">SMS notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For hospital chains</CardDescription>
                <div className="text-4xl font-bold text-gray-900 mt-4">₹75,000</div>
                <div className="text-sm text-gray-600">One-time payment</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Multi-location support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Advanced reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">24/7 phone support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">On-site training</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              All plans include 12 months of free updates and email support. 
              No recurring fees or hidden costs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                30-day money back guarantee
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Shield className="w-3 h-3 mr-1" />
                Secure payment processing
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                <Stethoscope className="w-3 h-3 mr-1" />
                HIPAA compliant
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join hundreds of rural hospitals that have modernized their operations 
            with MedCare Rural. Start your digital transformation today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
              <Download className="w-5 h-5 mr-2" />
              Download Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Free training included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-8 h-8 text-blue-400" weight="fill" />
                <span className="text-2xl font-bold">MedCare Rural</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Professional hospital management software designed specifically for rural healthcare. 
                Helping hospitals deliver better patient care with modern technology.
              </p>
              <div className="flex gap-4">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  <Shield className="w-3 h-3 mr-1" />
                  ISO 27001 Certified
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#training" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MedCare Software Solutions. All rights reserved. | Licensed Software - Premium Edition</p>
          </div>
        </div>
      </footer>
    </div>
  )
}