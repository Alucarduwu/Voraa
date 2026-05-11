import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Redemption } from '../types/index';

const RedemptionHistory: React.FC = () => {
  const [history, setHistory] = useState<Redemption[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, "redemptions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Redemption)));
    };
    fetchHistory();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Historial de Redenciones</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Total Original</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Descuento</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Total Final</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Propina Sug. (12%)</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map(red => (
              <tr key={red.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="px-6 py-4 font-medium">{red.userId}</td>
                <td className="px-6 py-4">${red.originalTotal}</td>
                <td className="px-6 py-4 text-success">-${red.discountAmount}</td>
                <td className="px-6 py-4 font-bold">${red.finalTotal}</td>
                <td className="px-6 py-4 text-purple-600 font-semibold">${red.suggestedTip12.toFixed(2)}</td>
                <td className="px-6 py-4"><span className="badge badge-success">Confirmada</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RedemptionHistory;
