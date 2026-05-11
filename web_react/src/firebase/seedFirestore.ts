import { db } from './firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export const seedFirestore = async () => {
  try {
    console.log("🚀 Sincronizando Base de Datos Real VORAA...");

    const now = Timestamp.now();
    const future = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));

    // IMÁGENES DEMO
    const imgCoffee = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800";
    const imgRestaurant = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800";

    // 1. USUARIOS (ROLES: admin, restaurant, client)
    const users = {
      "demo-admin": {
        uid: "demo-admin",
        code: "ADM-001",
        name: "Admin Voraa",
        email: "admin@voraa.com",
        role: "admin",
        createdAt: now, updatedAt: now
      },
      "demo-staff-1": {
        uid: "demo-staff-1",
        code: "STAFF-001",
        name: "Carlos Staff",
        email: "staff@cafecentral.com",
        role: "restaurant",
        createdAt: now, updatedAt: now
      },
      "demo-client-1": {
        uid: "demo-client-1",
        code: "USR-001",
        name: "Ana López",
        email: "cliente@demo.com",
        role: "client",
        frequentLevel: "Gold",
        completedVisits: 12,
        totalSavings: 850,
        positiveInteractions: 10,
        openReports: 0,
        createdAt: now, updatedAt: now
      }
    };

    for (const [id, data] of Object.entries(users)) {
      await setDoc(doc(db, "users", id), data);
    }

    // 2. VENUES
    const venueId = "demo-venue-1";
    await setDoc(doc(db, "venues", venueId), {
      id: venueId,
      name: "Café Central",
      type: "Cafetería Gourmet",
      city: "Aguascalientes",
      ownerUid: "demo-staff-1",
      active: true,
      createdAt: now, updatedAt: now
    });

    // 3. PRODUCTOS (Para el CRUD de cuentas)
    const products = [
      { id: "p1", name: "Cappuccino Italiano", price: 65, category: "Café" },
      { id: "p2", name: "Frappé de Caramelo", price: 85, category: "Fríos" },
      { id: "p3", name: "Croissant Jamón/Queso", price: 95, category: "Comida" },
      { id: "p4", name: "Cheesecake Arándanos", price: 75, category: "Postres" },
      { id: "p5", name: "Té Chai Latte", price: 70, category: "Té" }
    ];

    for (const p of products) {
      await setDoc(doc(db, "products", p.id), {
        ...p,
        venueId: venueId,
        active: true,
        createdAt: now, updatedAt: now
      });
    }

    // 4. CUPONES
    const coupons = {
      "cp-1": {
        id: "cp-1",
        venueId: venueId,
        venueName: "Café Central",
        title: "20% OFF en Bebidas",
        description: "Válido en toda la barra de cafés y tés.",
        discountType: "percentage",
        discountValue: 20,
        imageUrl: imgCoffee,
        combinable: false,
        active: true,
        validFrom: now, validUntil: future,
        createdAt: now, updatedAt: now
      },
      "cp-2": {
        id: "cp-2",
        venueId: venueId,
        venueName: "Café Central",
        title: "$50 de Descuento",
        description: "En consumos mayores a $300.",
        discountType: "fixed",
        discountValue: 50,
        imageUrl: imgRestaurant,
        combinable: true,
        active: true,
        validFrom: now, validUntil: future,
        createdAt: now, updatedAt: now
      }
    };

    for (const [id, data] of Object.entries(coupons)) {
      await setDoc(doc(db, "coupons", id), data);
    }

    // 5. CUPONES GUARDADOS/SOLICITADOS (Demo flujo)
    await setDoc(doc(db, "savedCoupons", "sc-1"), {
      id: "sc-1",
      userId: "demo-client-1",
      couponId: "cp-1",
      venueId: venueId,
      status: "requested",
      selectedForNextBill: true,
      savedAt: now,
      requestedAt: now
    });

    // 6. CUENTA ABIERTA (Demo Dashboard)
    const billId = "bill-active-1";
    await setDoc(doc(db, "activeBills", billId), {
      id: billId,
      userId: "demo-client-1",
      userCode: "USR-001",
      userName: "Ana López",
      venueId: venueId,
      venueName: "Café Central",
      status: "open",
      items: [
        { productId: "p1", name: "Cappuccino Italiano", quantity: 2, price: 65, total: 130 }
      ],
      appliedCoupons: [
        { couponId: "cp-1", title: "20% OFF en Bebidas", discountType: "percentage", discountValue: 20, discountAmount: 26 }
      ],
      originalTotal: 130,
      discountTotal: 26,
      finalTotal: 104,
      suggestedTip10: 13,
      suggestedTip12: 15.6,
      suggestedTip15: 19.5,
      savings: 26,
      restaurantFeedback: "pending",
      clientFeedback: "pending",
      hasReport: false,
      createdAt: now, updatedAt: now
    });

    console.log("✅ Base de datos sincronizada con éxito.");
  } catch (error) {
    console.error("❌ VORAA_SEED_ERROR:", error);
    throw error;
  }
};
