'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { withdrawApplication } from '@/app/actions/application';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawApplicationButtonProps {
  applicationId: string;
}

export default function WithdrawApplicationButton({ applicationId }: WithdrawApplicationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleWithdraw = () => {
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      
      if (result.error) {
        toast.error(result.error);
        setIsOpen(false);
        return;
      }
      
      toast.success('Application withdrawn successfully');
      setIsOpen(false);
      // Optional: Refresh is handled by revalidatePath in server action, but just in case
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-500/20 rounded-md hover:bg-red-500/10 transition-colors bg-red-500/5 mt-3 sm:mt-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Withdraw
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-[#0f0f11] border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Withdraw Application</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to withdraw? This will permanently remove your application from the employer's dashboard and cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWithdraw();
                }}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isPending ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
