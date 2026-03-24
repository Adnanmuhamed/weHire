'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateCompanyProfile } from '@/app/actions/company-profile';

interface CompanyProfileFormProps {
  company: {
    name: string;
    accountType: string | null;
    industryType: string | null;
    websiteUrl: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    gstin: string | null;
    about: string | null;
    foundedYear: string | null;
  };
  user: {
    designation: string | null;
  };
}

export default function CompanyProfileForm({ company, user }: CompanyProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountType: company.accountType || '',
    industryType: company.industryType || '',
    websiteUrl: company.websiteUrl || '',
    designation: user.designation || '',
    about: company.about || '',
    foundedYear: company.foundedYear || '',
    address: company.address || '',
    city: company.city || '',
    state: company.state || '',
    pincode: company.pincode || '',
    gstin: company.gstin || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateCompanyProfile(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Company profile updated successfully');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 2: Company Details */}
      <section className="bg-background border border-foreground/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Company Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Company Name (Read-only)
            </label>
            <input
              type="text"
              value={company.name}
              disabled
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-foreground/5 text-foreground/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Company Type
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
            >
              <option value="">Select type</option>
              <option value="Company/business">Company/business</option>
              <option value="Individual/proprietor">Individual/proprietor</option>
              <option value="Startup">Startup</option>
              <option value="MNC">MNC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Industry Type
            </label>
            <input
              type="text"
              value={formData.industryType}
              onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
              placeholder="e.g., IT Services, Healthcare, Finance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
              placeholder="https://company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Your Designation
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
              placeholder="HR Manager, Founder, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Founded Year
            </label>
            <input
              type="text"
              value={formData.foundedYear}
              onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
              placeholder="2020"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              About Company
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
              placeholder="Tell candidates about your company..."
            />
          </div>
        </div>
      </section>

      {/* Section 3: KYC / Address Details */}
      <section className="bg-background border border-foreground/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">KYC / Address Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Company Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
              placeholder="Street, Area"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                placeholder="400001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
