// Temporary component to view reference images for redesign
import ref1 from "@assets/WhatsApp Image 2025-09-19 at 6.25.06 PM_1758644020995.jpeg";
import ref2 from "@assets/WhatsApp Image 2025-09-19 at 6.25.07 PM_1758644020994.jpeg";

export function DesignReference() {
  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6">Design References</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Reference 1</h3>
          <img src={ref1} alt="Design Reference 1" className="w-full rounded-lg shadow-lg" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Reference 2</h3>
          <img src={ref2} alt="Design Reference 2" className="w-full rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
  );
}