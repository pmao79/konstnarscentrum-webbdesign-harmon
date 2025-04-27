import { useNavigate } from 'react-router-dom';

interface VarukorgItem {
  produkt: {
    huvudnamn: string;
    varumärke: string;
  };
  variant: {
    namn: string;
    pris: number;
  };
  antal: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  varukorg: VarukorgItem[];
  onTaBort: (produktNamn: string, variantNamn: string) => void;
  onOkaAntal: (produktNamn: string, variantNamn: string) => void;
  onMinskaAntal: (produktNamn: string, variantNamn: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  varukorg,
  onTaBort,
  onOkaAntal,
  onMinskaAntal,
}: CartDrawerProps) {
  const navigate = useNavigate();

  const beraknaTotalsumma = () => {
    return varukorg.reduce((sum, item) => sum + (item.variant.pris * item.antal), 0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[90%] md:w-[400px] bg-white shadow-lg p-4 overflow-y-auto z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Din varukorg</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {varukorg.length === 0 ? (
          <p className="text-gray-600">Din varukorg är tom.</p>
        ) : (
          <>
            <div className="space-y-4">
              {varukorg.map((item, index) => (
                <div
                  key={index}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{item.produkt.huvudnamn}</p>
                      <p className="text-gray-600">{item.variant.namn}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">Antal:</span>
                        <button
                          onClick={() => onMinskaAntal(item.produkt.huvudnamn, item.variant.namn)}
                          className="bg-gray-200 text-gray-700 py-1 px-2 rounded hover:bg-gray-300 text-sm"
                        >
                          −
                        </button>
                        <span className="mx-2">{item.antal}</span>
                        <button
                          onClick={() => onOkaAntal(item.produkt.huvudnamn, item.variant.namn)}
                          className="bg-gray-200 text-gray-700 py-1 px-2 rounded hover:bg-gray-300 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold">
                        {(item.variant.pris * item.antal).toFixed(2)} kr
                      </p>
                      <button
                        onClick={() => onTaBort(item.produkt.huvudnamn, item.variant.namn)}
                        className="bg-red-100 text-red-700 py-1 px-3 rounded hover:bg-red-200 text-sm"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-lg font-bold text-right">
                Totalsumma: {beraknaTotalsumma().toFixed(2)} kr
              </p>
            </div>

            <button
              onClick={() => {
                navigate('/kassa');
                onClose();
              }}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full mt-6"
            >
              Gå till kassan
            </button>
          </>
        )}
      </div>
    </>
  );
} 