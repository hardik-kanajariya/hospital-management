import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  Users, 
  Calendar, 
  CreditCard, 
  Package, 
  Activity,
  CheckCircle,
  Star,
  Play,
  Download,
  Shield,
  Clock,
  Globe,
  Award,
  TrendingUp,
  BarChart3,
  Smartphone,
  Lock,
  Zap,
  ArrowRight,
  Quote,
  MapPin,
  Mail,
  Phone
} from '@phosphor-icons/react'

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Complete patient records with medical history, vaccination tracking, and family information management.",
      benefits: ["360° Patient View", "Medical History Tracking", "Vaccination Records", "Family Health Records"]
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Advanced appointment scheduling with automated reminders, queue management, and conflict resolution.",
      benefits: ["Real-time Availability", "SMS/Email Reminders", "Queue Management", "Conflict Resolution"]
    },
    {
      icon: CreditCard,
      title: "Billing & Insurance",
      description: "Automated billing with insurance claim processing, payment tracking, and tax compliance.",
      benefits: ["Automated Invoicing", "Insurance Claims", "Payment Tracking", "Tax Compliance"]
    },
    {
      icon: Package,
      title: "Inventory Control",
      description: "Complete medical supply tracking with expiry alerts, automated reordering, and cost analysis.",
      benefits: ["Stock Monitoring", "Expiry Alerts", "Auto Reordering", "Cost Analysis"]
    },
    {
      icon: Activity,
      title: "Lab Management",
      description: "Digital lab requisitions, result tracking, report generation, and critical value alerts.",
      benefits: ["Digital Requisitions", "Result Tracking", "Auto Reports", "Critical Alerts"]
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "HIPAA-compliant security with role-based access, audit trails, and data encryption.",
      benefits: ["HIPAA Compliant", "Role-based Access", "Audit Trails", "Data Encryption"]
    }
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      hospital: "Regional Medical Center",
      content: "MedCare Rural transformed our hospital operations. We reduced administrative time by 40% and improved patient satisfaction significantly.",
      rating: 5,
      location: "Texas, USA"
    },
    {
      name: "Michael Chen",
      role: "Hospital Administrator", 
      hospital: "City General Hospital",
      content: "The billing module alone paid for the software in the first month. Insurance claims processing is now automated and error-free.",
      rating: 5,
      location: "California, USA"
    },
    {
      name: "Dr. Raj Patel",
      role: "Medical Director",
      hospital: "Rural Health Clinic",
      content: "As a rural hospital, we needed something comprehensive yet affordable. MedCare Rural delivered exactly what we needed.",
      rating: 5,
      location: "Gujarat, India"
    }
  ]

  const pricingPlans = [
    {
      name: "Small Clinic",
      description: "Perfect for clinics with 1-25 beds",
      price: "$2,995",
      originalPrice: "$4,995",
      savings: "Save $2,000",
      features: [
        "Patient Management",
        "Basic Scheduling", 
        "Billing System",
        "Inventory Tracking",
        "Email Support",
        "12 Months Updates"
      ],
      popular: false,
      beds: "1-25 beds"
    },
    {
      name: "Medium Hospital",
      description: "Ideal for hospitals with 26-100 beds",
      price: "$5,995",
      originalPrice: "$9,995", 
      savings: "Save $4,000",
      features: [
        "All Small Clinic Features",
        "Advanced Scheduling",
        "Lab Management",
        "Bed Management",
        "Priority Support",
        "Custom Branding",
        "Staff Training Included"
      ],
      popular: true,
      beds: "26-100 beds"
    },
    {
      name: "Large Hospital",
      description: "Enterprise solution for 100+ beds",
      price: "$9,995",
      originalPrice: "$15,995",
      savings: "Save $6,000", 
      features: [
        "All Medium Hospital Features",
        "Multi-Department Setup",
        "Advanced Analytics",
        "Custom Integrations",
        "24/7 Phone Support",
        "On-site Implementation",
        "Unlimited Staff Training"
      ],
      popular: false,
      beds: "100+ beds"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Patients Managed Daily", icon: Users },
    { number: "500+", label: "Hospitals Worldwide", icon: Activity },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield },
    { number: "40%", label: "Admin Time Saved", icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
                <Heart className="w-5 h-5" weight="fill" />
              </div>
              <span className="text-xl font-bold">MedCare Rural</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">Demo</a>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-primary">
                  <Award className="w-4 h-4 mr-2" />
                  #1 Hospital Management Software 2024
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Complete Hospital Management
                  <span className="text-primary block">Made Simple</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transform your healthcare facility with our comprehensive, affordable hospital management system. 
                  Streamline operations, improve patient care, and boost revenue with one powerful solution.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8">
                  <Download className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>30-Day Money Back</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Free Setup & Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                <div className="bg-card rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                        <Heart className="w-4 h-4" weight="fill" />
                      </div>
                      <span className="font-semibold">Dashboard Overview</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-accent/10 rounded-lg p-3">
                        <div className="text-2xl font-bold text-accent">247</div>
                        <div className="text-sm text-muted-foreground">Patients Today</div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">18</div>
                        <div className="text-sm text-muted-foreground">Active Doctors</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bed Occupancy</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full w-[87%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Revenue +23%</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Everything Your Hospital Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive modules designed specifically for healthcare facilities. 
              From patient care to financial management, we've got you covered.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const isActive = activeFeature === index
                
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{feature.description}</p>
                      {isActive && (
                        <div className="grid grid-cols-2 gap-2">
                          {feature.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
              <div className="bg-card rounded-xl shadow-xl p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{features[activeFeature].title}</h3>
                  <p className="text-muted-foreground text-sm">{features[activeFeature].description}</p>
                </div>
                
                <div className="space-y-3">
                  {features[activeFeature].benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-6" variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <CreditCard className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              One-Time Purchase, Lifetime Value
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No monthly fees or hidden costs. Pay once and own the software forever. 
              Choose the plan that fits your facility size and needs.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" weight="fill" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mb-2">
                    <div className="text-sm text-muted-foreground">{plan.beds}</div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="py-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-3xl lg:text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>
                    <div className="text-sm text-muted-foreground line-through">{plan.originalPrice}</div>
                    <Badge variant="secondary" className="mt-2 text-accent">
                      {plan.savings}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    <Download className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                  
                  <div className="text-center text-xs text-muted-foreground">
                    30-day money-back guarantee
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Need a custom solution? Have questions about licensing?
            </p>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Quote className="w-4 h-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of healthcare facilities worldwide who have transformed 
              their operations with MedCare Rural.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500" weight="fill" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-muted-foreground/30 absolute top-4 right-4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  
                  <div className="pt-4 border-t">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.hospital}</div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare facilities who have streamlined their operations, 
            improved patient care, and increased revenue with MedCare Rural.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Download className="w-5 h-5 mr-2" />
              Download Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
              <Phone className="w-5 h-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 opacity-90">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">30-Day Free Trial</span>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-90">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Money-Back Guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-90">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Free Setup & Training</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
                  <Heart className="w-5 h-5" weight="fill" />
                </div>
                <span className="text-xl font-bold">MedCare Rural</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Complete hospital management solution for modern healthcare facilities.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Serving 500+ hospitals worldwide</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-foreground transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">License Agreement</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 MedCare Rural. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                SOC 2 Certified
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage