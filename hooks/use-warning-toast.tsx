import { useRef, useState } from 'react';

const useWarningToast = () => {
  const [showWarning, setShowWarning] = useState(false);
  const notifiedRef = useRef(false);
  const prevStatusRef = useRef<string | null>(null);

  const handleStatusChange = (status: string) => {
    // Hanya tampilkan toast jika status berubah ke "tidak layak" dari status lain
    if (
      status.toLowerCase() === 'tidak layak' &&
      !notifiedRef.current &&
      prevStatusRef.current !== 'tidak layak'
    ) {
      setShowWarning(true);
      notifiedRef.current = true;

      setTimeout(() => {
        setShowWarning(false);
      }, 5000); // Toast hilang setelah 5 detik

      // Reset notifiedRef setelah 5 menit agar bisa muncul lagi
      setTimeout(() => {
        notifiedRef.current = false;
      }, 5 * 60 * 1000);
    } else if (status.toLowerCase() !== 'tidak layak') {
      // Reset notifiedRef jika status bukan "tidak layak"
      notifiedRef.current = false;
      setShowWarning(false);
    }

    prevStatusRef.current = status.toLowerCase();
  };

  return { handleStatusChange, showWarning };
};

export default useWarningToast;