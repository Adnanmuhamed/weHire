'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { registerEmployerAction } from '@/app/actions/employer-signup';

export default function EmployerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    accountType: 'Company/business',
    mobile: '',
    fullName: '',
    email: '',
    password: '',
    hiringFor: 'Own Company',
    companyName: '',
    employeeCount: '1-10',
    designation: '',
    pincode: '',
    address: '',
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile || !formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.designation || !formData.pincode || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    const result = await registerEmployerAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success('Account created successfully!');
      router.push('/employer');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Employer Registration
          </h1>
          <p className="text-foreground/60">
            Step {step} of 2
          </p>
        </div>

        <div className="bg-background border border-foreground/10 rounded-lg shadow-lg p-6">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Basic Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Account Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountType"
                      value="Company/business"
                      checked={formData.accountType === 'Company/business'}
                      onChange={(e) =>
                        setFormData({ ...formData, accountType: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Company/business</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountType"
                      value="Individual/proprietor"
                      checked={formData.accountType === 'Individual/proprietor'}
                      onChange={(e) =>
                        setFormData({ ...formData, accountType: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Individual/proprietor</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="+91 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Full Name (as per PAN) *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Official Email ID *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="john@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-foreground/70 hover:underline mb-2"
              >
                ← Back
              </button>

              <h2 className="text-xl font-semibold text-foreground mb-4">
                Company Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hiring For *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hiringFor"
                      value="Own Company"
                      checked={formData.hiringFor === 'Own Company'}
                      onChange={(e) =>
                        setFormData({ ...formData, hiringFor: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Hiring for your company</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hiringFor"
                      value="Consultancy"
                      checked={formData.hiringFor === 'Consultancy'}
                      onChange={(e) =>
                        setFormData({ ...formData, hiringFor: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">A consultancy</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="Acme Corp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Number of Employees *
                </label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  required
                >
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Your Designation *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="HR Manager"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="110001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Company Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  placeholder="Street, Area, City"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Submit'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-foreground/60 mt-4">
            Already have an account?{' '}
            <Link href="/login?role=EMPLOYER" className="text-foreground hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
