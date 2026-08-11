import { X } from "lucide-react";

interface PremiumContentVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumContentVideoModal({ isOpen, onClose }: PremiumContentVideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Premium Content</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600">
          Upgrade to unlock premium guided meditations and full aura reports.
        </p>
      </div>
    </div>
  );
}
