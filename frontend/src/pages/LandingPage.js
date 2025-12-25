import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, X, Sparkles, Shield, Globe2, BarChart3, Search, Check, Star } from "lucide-react";
import { toast } from "sonner";

// Logo component
const Logo = ({ className = "h-8" }) => (
  <img 
    src="https://customer-assets.emergentagent.com/job_a3b49cbe-3a5b-4133-8118-237a4bc11a65/artifacts/xw0jvksu_rightname.ai%20logo%20%281%29.png" 
    alt="RIGHTNAME" 
    className={className}
  />
);

// Animated gradient text
const GradientText = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

// Floating Badge
const FloatingBadge = ({ children, className = "" }) => (
  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg shadow-purple-200/50 border border-purple-100 ${className}`}>
    {children}
  </div>
);

// Stats Pill
const StatPill = ({ value, label, emoji }) => (
  <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg shadow-purple-100/50 border border-gray-100">
    <span className="text-2xl">{emoji}</span>
    <div>
      <div className="text-xl font-black text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

// Showcase Card with playful design
const ShowcaseCard = ({ title, score, verdict, color }) => (
  <div className={`relative p-5 rounded-3xl ${color} transform hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer shadow-xl`}>
    <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
    <div className="text-white/80 text-xs font-medium mb-1">Brand Score</div>
    <div className="text-white text-lg font-bold mb-4">{title}</div>
    <div className="flex items-end justify-between">
      <div className="text-5xl font-black text-white">{score}</div>
      <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
        verdict === 'GO' ? 'bg-white text-emerald-600' : 'bg-white/90 text-amber-600'
      }`}>
        {verdict} ✓
      </div>
    </div>
  </div>
);

// Feature Card
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="group p-6 bg-white rounded-3xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

// Testimonial
const Testimonial = ({ quote, author, role, avatar }) => (
  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-gray-700 mb-4 italic">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
        {avatar}
      </div>
      <div>
        <div className="font-bold text-gray-900">{author}</div>
        <div className="text-xs text-gray-500">{role}</div>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brand_names: '',
    industry: '',
    category: '',
    product_type: 'Digital',
    usp: '',
    brand_vibe: '',
    positioning: 'Premium',
    market_scope: 'Multi-Country',
    countries: 'USA, India, UK'
  });

  const industries = [
    "Technology & Software", "E-commerce & Retail", "Finance & Banking", "Healthcare & Pharma",
    "Food & Beverage", "Fashion & Apparel", "Beauty & Cosmetics", "Travel & Hospitality",
    "Real Estate & Property", "Education & EdTech", "Media & Entertainment", "Automotive",
    "Professional Services", "Sports & Fitness", "Home & Living", "Gaming", "Other"
  ];

  const productTypes = [
    { value: "Physical", label: "Physical Product" },
    { value: "Digital", label: "Digital Product/App" },
    { value: "Service", label: "Service" },
    { value: "Hybrid", label: "Hybrid" }
  ];

  const uspOptions = [
    { value: "Price", label: "Best value" },
    { value: "Quality", label: "Superior quality" },
    { value: "Speed", label: "Fastest" },
    { value: "Design", label: "Beautiful design" },
    { value: "Eco-Friendly", label: "Sustainable" },
    { value: "Innovation", label: "Innovative" }
  ];

  const brandVibes = [
    { value: "Professional", label: "Professional" },
    { value: "Playful", label: "Playful" },
    { value: "Luxurious", label: "Luxurious" },
    { value: "Minimalist", label: "Minimalist" },
    { value: "Bold", label: "Bold" },
    { value: "Innovative", label: "Innovative" }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand_names.trim()) {
      toast.error("Please enter at least one brand name");
      return;
    }
    setLoading(true);
    try {
      const brandNames = formData.brand_names.split(',').map(n => n.trim()).filter(n => n);
      const countries = formData.countries.split(',').map(c => c.trim()).filter(c => c);
      
      const payload = {
        brand_names: brandNames,
        industry: formData.industry || 'General',
        category: formData.category || 'General',
        product_type: formData.product_type,
        usp: formData.usp || '',
        brand_vibe: formData.brand_vibe || '',
        positioning: formData.positioning,
        market_scope: formData.market_scope,
        countries: countries.length > 0 ? countries : ['USA']
      };

      const result = await api.evaluate(payload);
      navigate('/dashboard', { state: { data: result, query: payload } });
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white overflow-x-hidden">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Logo className="h-7 md:h-9" />
          
          <div className="flex items-center gap-4">
            {authLoading ? (
              <div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">Hi, {user.name?.split(' ')[0]}!</span>
                <button 
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal()}
                className="text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 px-6 py-2.5 rounded-full shadow-lg shadow-purple-200/50 transition-all hover:scale-105"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 md:pt-20 md:pb-32">
          
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Badge */}
            <FloatingBadge className="mb-8 animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm font-semibold text-gray-700">AI-Powered Brand Intelligence</span>
              <span className="text-lg">🚀</span>
            </FloatingBadge>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tight">
              Is Your Brand Name
              <br />
              <GradientText>Legally Safe?</GradientText>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get instant, <span className="font-bold text-purple-600">consulting-grade analysis</span> on 
              trademark risk, cultural resonance, and domain availability. 
              <span className="font-bold text-pink-500"> No guesswork.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setShowForm(true)}
                className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-bold px-8 py-4 rounded-full shadow-xl shadow-purple-300/50 hover:shadow-2xl hover:shadow-purple-400/50 transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                Start Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <StatPill value="50K+" label="Names Analyzed" emoji="📊" />
              <StatPill value="30s" label="Avg Report Time" emoji="⚡" />
              <StatPill value="98%" label="Accuracy Rate" emoji="🎯" />
            </div>
          </div>
          
          {/* Showcase Cards */}
          <div className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <ShowcaseCard 
              title="LUXEVA" 
              score="89" 
              verdict="GO" 
              color="bg-gradient-to-br from-purple-500 to-indigo-600"
            />
            <ShowcaseCard 
              title="NOVAGLOW" 
              score="83" 
              verdict="GO" 
              color="bg-gradient-to-br from-pink-500 to-rose-600"
            />
            <ShowcaseCard 
              title="ZENITH" 
              score="76" 
              verdict="CONDITIONAL" 
              color="bg-gradient-to-br from-orange-400 to-amber-500"
            />
          </div>
        </div>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                What You <GradientText>Get</GradientText>
              </h2>
              <p className="mt-4 text-xl text-gray-500 max-w-xl mx-auto">
                Everything you need to validate your brand name before launch
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={Shield}
                title="Legal Risk Matrix" 
                description="Trademark conflicts, genericness analysis, and rebranding probability assessment"
                color="bg-gradient-to-br from-purple-500 to-indigo-500"
              />
              <FeatureCard 
                icon={Globe2}
                title="Global Culture Fit" 
                description="Linguistic and cultural resonance analysis across 180+ countries"
                color="bg-gradient-to-br from-pink-500 to-rose-500"
              />
              <FeatureCard 
                icon={BarChart3}
                title="Market Positioning" 
                description="Competitor analysis with strategic positioning matrices by country"
                color="bg-gradient-to-br from-orange-400 to-amber-500"
              />
              <FeatureCard 
                icon={Search}
                title="Domain & Social" 
                description="Real-time availability check for domains and social media handles"
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gradient-to-b from-purple-50/50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900">
                Loved by <GradientText>Founders</GradientText>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Testimonial 
                quote="Saved us from a $50K trademark dispute. The legal risk analysis caught what our lawyers missed!"
                author="Sarah Chen"
                role="CEO, TechFlow"
                avatar="S"
              />
              <Testimonial 
                quote="Got our brand validated in 30 seconds. The cultural analysis helped us avoid a huge mistake in Asia."
                author="Marcus Kim"
                role="Founder, LUXORA"
                avatar="M"
              />
              <Testimonial 
                quote="Best $0 I ever spent. The free analysis was more thorough than a $5K brand consultant."
                author="Emily Ross"
                role="CMO, NovaBrand"
                avatar="E"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="relative p-12 md:p-16 rounded-[3rem] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to validate your brand?
                </h2>
                <p className="text-xl text-white/80 mb-8">
                  Join 10,000+ founders who trust RIGHTNAME
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="group inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo className="h-6" />
                <span className="text-sm text-gray-400">© 2025 RIGHTNAME</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-purple-600 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Analysis Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Start Analysis
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Enter your brand details</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Brand Name */}
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">Brand Name(s) *</Label>
                <Input 
                  name="brand_names"
                  value={formData.brand_names}
                  onChange={handleChange}
                  placeholder="e.g. LUMINA, ZENOVA"
                  className="h-14 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-200 rounded-xl text-lg font-medium"
                  required
                />
                <p className="text-xs text-gray-400 mt-1.5">Separate multiple names with commas</p>
              </div>

              {/* Industry & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Industry</Label>
                  <Select onValueChange={(val) => handleSelectChange('industry', val)} value={formData.industry}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Category</Label>
                  <Input 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Skincare"
                    className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Product Type & Positioning */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Product Type</Label>
                  <Select onValueChange={(val) => handleSelectChange('product_type', val)} value={formData.product_type}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((pt) => (
                        <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Positioning</Label>
                  <Select onValueChange={(val) => handleSelectChange('positioning', val)} value={formData.positioning}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Budget">Budget</SelectItem>
                      <SelectItem value="Mid-Range">Mid-Range</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* USP & Brand Vibe */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">USP</Label>
                  <Select onValueChange={(val) => handleSelectChange('usp', val)} value={formData.usp}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uspOptions.map((usp) => (
                        <SelectItem key={usp.value} value={usp.value}>{usp.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Brand Vibe</Label>
                  <Select onValueChange={(val) => handleSelectChange('brand_vibe', val)} value={formData.brand_vibe}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brandVibes.map((vibe) => (
                        <SelectItem key={vibe.value} value={vibe.value}>{vibe.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Market & Countries */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Market Scope</Label>
                  <Select onValueChange={(val) => handleSelectChange('market_scope', val)} value={formData.market_scope}>
                    <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Country">Single Country</SelectItem>
                      <SelectItem value="Multi-Country">Multi-Country</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Countries</Label>
                  <Input 
                    name="countries"
                    value={formData.countries}
                    onChange={handleChange}
                    placeholder="USA, India, UK"
                    className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-200/50 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Generate Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <p className="text-center text-sm text-gray-400">
                ✨ Free analysis • No credit card required • Results in ~30s
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
