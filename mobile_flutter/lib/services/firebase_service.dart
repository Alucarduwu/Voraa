import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/models.dart';

class FirebaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<UserProfile> getUserProfile(String userId) {
    return _db.collection('users').doc(userId).snapshots().map((doc) {
      if (!doc.exists) {
        return UserProfile(
          uid: userId, code: 'USR-???', name: 'Usuario Pendiente', email: '', role: '',
          frequentLevel: 'None', completedVisits: 0, totalSavings: 0, positiveInteractions: 0, openReports: 0
        );
      }
      return UserProfile.fromMap(doc.data() as Map<String, dynamic>, doc.id);
    });
  }

  Stream<List<Coupon>> getAvailableCoupons() {
    return _db.collection('coupons').snapshots().map((snapshot) => 
      snapshot.docs
        .map((doc) => Coupon.fromMap(doc.data(), doc.id))
        .where((c) => c.active)
        .toList()
    );
  }

  Future<void> saveCoupon(String userId, Coupon coupon) async {
    final docId = 'sc_${userId}_${coupon.id}';
    await _db.collection('savedCoupons').doc(docId).set({
      'id': docId,
      'userId': userId,
      'couponId': coupon.id,
      'venueId': coupon.venueId,
      'status': 'saved',
      'selectedForNextBill': false,
      'savedAt': FieldValue.serverTimestamp(),
    });
  }

  Stream<List<Map<String, dynamic>>> getSavedCoupons(String userId) {
    return _db.collection('savedCoupons')
      .where('userId', isEqualTo: userId)
      .snapshots()
      .asyncMap((snapshot) async {
        List<Map<String, dynamic>> results = [];
        for (var d in snapshot.docs) {
          final data = d.data();
          final status = data['status'] ?? '';
          
          if (status == 'saved' || status == 'requested' || status == 'accepted') {
            final cSnap = await _db.collection('coupons').doc(data['couponId']).get();
            if (cSnap.exists) {
              results.add({
                'savedId': d.id,
                'savedData': data,
                'coupon': Coupon.fromMap(cSnap.data() as Map<String, dynamic>, cSnap.id)
              });
            }
          }
        }
        return results;
      });
  }

  Future<void> requestRedemption(String savedId, bool request) async {
    await _db.collection('savedCoupons').doc(savedId).update({
      'selectedForNextBill': request,
      'status': request ? 'requested' : 'saved',
      'requestedAt': request ? FieldValue.serverTimestamp() : null,
    });
  }

  Stream<List<ActiveBill>> getAllBills(String userId) {
    return _db.collection('activeBills')
      .where('userId', isEqualTo: userId)
      .snapshots()
      .map((snapshot) => 
        snapshot.docs
          .map((doc) => ActiveBill.fromMap(doc.data(), doc.id))
          .toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt))
      );
  }

  Stream<ActiveBill?> getActiveBill(String userId) {
    return getAllBills(userId).map((bills) {
      if (bills.isEmpty) return null;
      final active = bills.where((b) => b.status != 'closed').toList();
      return active.isNotEmpty ? active.first : null;
    });
  }

  Future<void> confirmBill(ActiveBill bill, String feedback) async {
    final batch = _db.batch();
    
    // 1. Update Bill
    batch.update(_db.collection('activeBills').doc(bill.id), {
      'clientFeedback': feedback,
      'status': feedback == 'positive' ? 'closed' : 'reported',
      'hasReport': feedback == 'negative',
      'updatedAt': FieldValue.serverTimestamp(),
      'closedAt': feedback == 'positive' ? FieldValue.serverTimestamp() : null,
    });

    // 2. Update User Metrics if positive
    if (feedback == 'positive') {
      batch.update(_db.collection('users').doc(bill.userId), {
        'completedVisits': FieldValue.increment(1),
        'totalSavings': FieldValue.increment(bill.savings),
        'positiveInteractions': FieldValue.increment(1),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      // 3. Mark coupons as redeemed
      final couponsSnap = await _db.collection('savedCoupons')
        .where('userId', isEqualTo: bill.userId)
        .where('venueId', isEqualTo: bill.venueId)
        .where('status', isEqualTo: 'accepted')
        .get();
        
      for (var d in couponsSnap.docs) {
        batch.update(d.reference, {
          'status': 'redeemed',
          'redeemedAt': FieldValue.serverTimestamp()
        });
      }
    }

    await batch.commit();
  }

  Future<void> createReport({
    required String billId,
    required String userId,
    required String userName,
    required String venueId,
    required String venueName,
    required String description,
    required String type,
  }) async {
    final repRef = _db.collection('reports').doc();
    await repRef.set({
      'id': repRef.id,
      'billId': billId,
      'userId': userId,
      'userName': userName,
      'venueId': venueId,
      'venueName': venueName,
      'origin': 'client',
      'type': type,
      'description': description,
      'status': 'open',
      'createdAt': FieldValue.serverTimestamp(),
    });
    
    await _db.collection('users').doc(userId).update({
      'openReports': FieldValue.increment(1),
    });
  }

  Stream<List<FrictionCase>> getMyReports(String userId) {
    return _db.collection('reports')
      .where('userId', isEqualTo: userId)
      .where('origin', isEqualTo: 'client')
      .snapshots()
      .map((snapshot) => 
        snapshot.docs
          .map((doc) => FrictionCase.fromMap(doc.data(), doc.id))
          .toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt))
      );
  }
}
