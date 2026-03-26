import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "🏠",
    title: "Property Listings",
    desc: "Landlords can list, manage, and showcase properties with ease.",
  },
  {
    icon: "🔍",
    title: "Smart Search",
    desc: "Tenants find homes by location and budget in seconds.",
  },
  {
    icon: "✅",
    title: "Ghana Card Verification",
    desc: "Secure identity checks build trust between parties.",
  },
  {
    icon: "📄",
    title: "Digital Agreements",
    desc: "Lease agreements generated automatically upon approval.",
  },
  {
    icon: "💳",
    title: "Payment Tracking",
    desc: "Monthly rent tracked digitally — no more paper receipts.",
  },
  {
    icon: "🔔",
    title: "Smart Reminders",
    desc: "Automated alerts for upcoming and overdue rent payments.",
  },
];

const stats = [
  { value: "500+", label: "Properties Listed" },
  { value: "1,200+", label: "Tenants Served" },
  { value: "98%", label: "Dispute Reduction" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary tracking-tight">RentGuard</span>
          <Badge variant="secondary" className="text-xs font-bold">Ghana</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="font-semibold">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="font-bold px-6 shadow-md shadow-primary/20">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 md:px-16 overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-primary/90">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 text-sm px-4 py-1.5 backdrop-blur-sm">
            🇬🇭 Built for Ghana&apos;s Rental Market
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Renting in Ghana,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-orange-400">
              reimagined.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            RentGuard brings transparency, fairness, and efficiency to Ghana&apos;s rental housing market — for landlords and tenants alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-primary hover:bg-gray-100 shadow-xl shadow-black/20">
                Start for Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold text-white border-white/30 hover:bg-white/10 backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl py-6 px-4 border border-white/10">
              <p className="text-3xl md:text-4xl font-black text-white mb-1">{s.value}</p>
              <p className="text-sm text-white/60 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4">Why RentGuard?</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Everything you need, nothing you don&apos;t.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A complete digital rental management system that replaces paperwork, phone calls, and disputes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="group border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-16 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to get started?</h2>
          <p className="text-white/70 text-lg mb-10">
            Join landlords and tenants across Ghana who are already managing rentals the modern way.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="h-14 px-12 text-lg font-bold bg-white text-primary hover:bg-gray-100 shadow-xl">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-gray-400 bg-white">
        © {new Date().getFullYear()} RentGuard — Built for Ghana 🇬🇭
      </footer>
    </div>
  );
}
