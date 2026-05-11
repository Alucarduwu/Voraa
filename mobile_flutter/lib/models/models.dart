import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfile {
  final String uid;
  final String code;
  final String name;
  final String email;
  final String role;
  final String frequentLevel;
  final int completedVisits;
  final double totalSavings;
  final int positiveInteractions;
  final int openReports;

  UserProfile({
    required this.uid,
    required this.code,
    required this.name,
    required this.email,
    required this.role,
    required this.frequentLevel,
    required this.completedVisits,
    required this.totalSavings,
    required this.positiveInteractions,
    required this.openReports,
  });

  factory UserProfile.fromMap(Map<String, dynamic> data, String id) {
    return UserProfile(
      uid: id,
      code: data['code'] ?? '',
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      role: data['role'] ?? 'client',
      frequentLevel: data['frequentLevel'] ?? 'Bronce',
      totalSavings: (data['totalSavings'] ?? 0).toDouble(),
      completedVisits: data['completedVisits'] ?? 0,
      positiveInteractions: data['positiveInteractions'] ?? 0,
      openReports: data['openReports'] ?? 0,
    );
  }
}

class Coupon {
  final String id;
  final String venueId;
  final String venueName;
  final String title;
  final String description;
  final String discountType;
  final double discountValue;
  final String imageUrl;
  final bool combinable;
  final bool active;

  Coupon({
    required this.id,
    required this.venueId,
    required this.venueName,
    required this.title,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.imageUrl,
    required this.combinable,
    required this.active,
  });

  factory Coupon.fromMap(Map<String, dynamic> data, String id) {
    return Coupon(
      id: id,
      venueId: data['venueId'] ?? '',
      venueName: data['venueName'] ?? '',
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      discountType: data['discountType'] ?? 'percentage',
      discountValue: (data['discountValue'] ?? 0).toDouble(),
      imageUrl: data['imageUrl'] ?? '',
      combinable: data['combinable'] ?? false,
      active: data['active'] ?? true,
    );
  }
}

class SavedCoupon {
  final String id;
  final String userId;
  final String couponId;
  final String venueId;
  final String status;
  final bool selectedForNextBill;

  SavedCoupon({
    required this.id,
    required this.userId,
    required this.couponId,
    required this.venueId,
    required this.status,
    required this.selectedForNextBill,
  });

  factory SavedCoupon.fromMap(Map<String, dynamic> data, String id) {
    return SavedCoupon(
      id: id,
      userId: data['userId'] ?? '',
      couponId: data['couponId'] ?? '',
      venueId: data['venueId'] ?? '',
      status: data['status'] ?? 'saved',
      selectedForNextBill: data['selectedForNextBill'] ?? false,
    );
  }
}

class ActiveBill {
  final String id;
  final String userId;
  final String userCode;
  final String userName;
  final String venueId;
  final String venueName;
  final String status;
  final List<dynamic> items;
  final List<dynamic> appliedCoupons;
  final double originalTotal;
  final double discountTotal;
  final double finalTotal;
  final double suggestedTip10;
  final double suggestedTip12;
  final double suggestedTip15;
  final double savings;
  final String restaurantFeedback;
  final String clientFeedback;
  final bool hasReport;
  final Timestamp createdAt;

  ActiveBill({
    required this.id,
    required this.userId,
    required this.userCode,
    required this.userName,
    required this.venueId,
    required this.venueName,
    required this.status,
    required this.items,
    required this.appliedCoupons,
    required this.originalTotal,
    required this.discountTotal,
    required this.finalTotal,
    required this.suggestedTip10,
    required this.suggestedTip12,
    required this.suggestedTip15,
    required this.savings,
    required this.restaurantFeedback,
    required this.clientFeedback,
    required this.hasReport,
    required this.createdAt,
  });

  factory ActiveBill.fromMap(Map<String, dynamic> data, String id) {
    return ActiveBill(
      id: id,
      userId: data['userId'] ?? '',
      userCode: data['userCode'] ?? '',
      userName: data['userName'] ?? '',
      venueId: data['venueId'] ?? '',
      venueName: data['venueName'] ?? '',
      status: data['status'] ?? 'open',
      items: data['items'] ?? [],
      appliedCoupons: data['appliedCoupons'] ?? [],
      originalTotal: (data['originalTotal'] ?? 0).toDouble(),
      discountTotal: (data['discountTotal'] ?? 0).toDouble(),
      finalTotal: (data['finalTotal'] ?? 0).toDouble(),
      suggestedTip10: (data['suggestedTip10'] ?? 0).toDouble(),
      suggestedTip12: (data['suggestedTip12'] ?? 0).toDouble(),
      suggestedTip15: (data['suggestedTip15'] ?? 0).toDouble(),
      savings: (data['savings'] ?? 0).toDouble(),
      restaurantFeedback: data['restaurantFeedback'] ?? 'pending',
      clientFeedback: data['clientFeedback'] ?? 'pending',
      hasReport: data['hasReport'] ?? false,
      createdAt: data['createdAt'] ?? Timestamp.now(),
    );
  }
}
class FrictionCase {
  final String id;
  final String billId;
  final String venueName;
  final String description;
  final String type;
  final String status;
  final String? adminNotes;
  final Timestamp createdAt;

  FrictionCase({
    required this.id,
    required this.billId,
    required this.venueName,
    required this.description,
    required this.type,
    required this.status,
    this.adminNotes,
    required this.createdAt,
  });

  factory FrictionCase.fromMap(Map<String, dynamic> data, String id) {
    return FrictionCase(
      id: id,
      billId: data['billId'] ?? '',
      venueName: data['venueName'] ?? 'Restaurante',
      description: data['description'] ?? '',
      type: data['type'] ?? 'other',
      status: data['status'] ?? 'open',
      adminNotes: data['adminNotes'],
      createdAt: data['createdAt'] ?? Timestamp.now(),
    );
  }
}
