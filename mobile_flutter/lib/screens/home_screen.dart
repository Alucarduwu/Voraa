import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../models/models.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  final String userId;

  const HomeScreen({super.key, required this.userId});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late final FirebaseService _firebase;

  @override
  void initState() {
    super.initState();
    _firebase = FirebaseService();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _InicioTab(userId: widget.userId, firebase: _firebase),
          _GuardadosTab(userId: widget.userId, firebase: _firebase),
          _QrTab(userId: widget.userId, firebase: _firebase),
          _CuentaTab(userId: widget.userId, firebase: _firebase),
          _PerfilTab(userId: widget.userId, firebase: _firebase),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(14, 0, 14, 14),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: AppColors.divider),
            boxShadow: const [
              BoxShadow(
                color: Color(0x12000000),
                blurRadius: 20,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.home),
                label: 'INICIO',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.bookmark),
                label: 'GUARDADOS',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.qrCode),
                label: 'MI QR',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.receipt),
                label: 'CUENTA',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.user),
                label: 'PERFIL',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InicioTab extends StatelessWidget {
  final String userId;
  final FirebaseService firebase;

  const _InicioTab({required this.userId, required this.firebase});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(top: 12, bottom: 112),
          child: appResponsiveFrame(
            context,
            Padding(
              padding: appPagePadding(context),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  StreamBuilder<UserProfile>(
                    stream: firebase.getUserProfile(userId),
                    builder: (context, snapshot) {
                      final user = snapshot.data;
                      return _HomeHero(user: user);
                    },
                  ),
                  const SizedBox(height: 28),
                  _SectionTitle(
                    eyebrow: 'Curaduria VORAA',
                    title: 'Beneficios para comer mejor hoy',
                    copy:
                        'Selecciona promos reales de restaurantes y llevalas listas a tu siguiente cuenta.',
                  ),
                  const SizedBox(height: 18),
                  StreamBuilder<List<Coupon>>(
                    stream: firebase.getAvailableCoupons(),
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 48),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }

                      final coupons = snapshot.data!;

                      if (coupons.isEmpty) {
                        return const _EmptyState(
                          icon: LucideIcons.utensilsCrossed,
                          title: 'No hay cupones disponibles',
                          copy: 'En cuanto haya nuevas promos aqui apareceran.',
                        );
                      }

                      return LayoutBuilder(
                        builder: (context, constraints) {
                          final crossAxisCount = constraints.maxWidth >= 920
                              ? 2
                              : constraints.maxWidth >= 640
                                  ? 2
                                  : 1;

                          final childAspectRatio = crossAxisCount == 1 ? 0.95 : 0.86;

                          return GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: coupons.length,
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: crossAxisCount,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              childAspectRatio: childAspectRatio,
                            ),
                            itemBuilder: (context, index) {
                              final coupon = coupons[index];
                              return _CouponCard(
                                coupon: coupon,
                                onSave: () => firebase.saveCoupon(userId, coupon),
                              );
                            },
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _GuardadosTab extends StatelessWidget {
  final String userId;
  final FirebaseService firebase;

  const _GuardadosTab({required this.userId, required this.firebase});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis cupones')),
      body: SafeArea(
        child: StreamBuilder<List<Map<String, dynamic>>>(
          stream: firebase.getSavedCoupons(userId),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final saved = snapshot.data!;

            if (saved.isEmpty) {
              return const Padding(
                padding: EdgeInsets.fromLTRB(20, 12, 20, 112),
                child: _EmptyState(
                  icon: LucideIcons.bookmark,
                  title: 'Aun no guardas cupones',
                  copy: 'Explora beneficios y aparta los que quieras usar en tu proxima visita.',
                ),
              );
            }

            return appResponsiveFrame(
              context,
              ListView.separated(
                padding: EdgeInsets.fromLTRB(
                  appPagePadding(context).left,
                  12,
                  appPagePadding(context).right,
                  112,
                ),
                itemCount: saved.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final item = saved[index];
                  final coupon = item['coupon'] as Coupon;
                  final savedData = item['savedData'] as Map<String, dynamic>;
                  final status = (savedData['status'] as String?) ?? 'saved';
                  final isRequested = status == 'requested' || status == 'accepted';

                  return _SurfaceCard(
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Image.network(
                            coupon.imageUrl,
                            width: 76,
                            height: 76,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 76,
                              height: 76,
                              color: AppColors.primarySoft,
                              child: const Icon(
                                LucideIcons.image,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _TinyLabel(coupon.venueName.toUpperCase()),
                              const SizedBox(height: 6),
                              Text(
                                coupon.title,
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.text,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                coupon.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.outfit(
                                  fontSize: 13,
                                  height: 1.4,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 10),
                              _StatusPill(
                                label: isRequested ? 'Listo para redimir' : 'Solo guardado',
                                color: isRequested ? AppColors.primary : AppColors.textMuted,
                                background: isRequested
                                    ? AppColors.primarySoft
                                    : const Color(0xFFF4F1FA),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Switch(
                          value: isRequested,
                          onChanged: (value) =>
                              firebase.requestRedemption(item['savedId'] as String, value),
                          activeColor: AppColors.primary,
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _QrTab extends StatelessWidget {
  final String userId;
  final FirebaseService firebase;

  const _QrTab({required this.userId, required this.firebase});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: StreamBuilder<UserProfile>(
          stream: firebase.getUserProfile(userId),
          builder: (context, snapshot) {
            final user = snapshot.data;
            final code = user?.code ?? '...';

            return SingleChildScrollView(
              padding: const EdgeInsets.only(top: 12, bottom: 112),
              child: appResponsiveFrame(
                context,
                Padding(
                  padding: appPagePadding(context),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _SectionTitle(
                        eyebrow: 'Tu acceso',
                        title: 'Tu pase para redimir en mesa',
                        copy:
                            'Muestralo al momento de pagar para que el restaurante aplique tus beneficios seleccionados.',
                      ),
                      const SizedBox(height: 20),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final wide = constraints.maxWidth >= 860;

                          final qrPanel = _SurfaceCard(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                Container(
                                  width: 72,
                                  height: 72,
                                  decoration: BoxDecoration(
                                    color: AppColors.primarySoft,
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: const Icon(
                                    LucideIcons.qrCode,
                                    color: AppColors.primary,
                                    size: 32,
                                  ),
                                ),
                                const SizedBox(height: 18),
                                Text(
                                  'Mi pase VORAA',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.outfit(
                                    fontSize: 30,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.text,
                                  ),
                                ),
                                const SizedBox(height: 20),
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8F6FF),
                                    borderRadius: BorderRadius.circular(32),
                                    border: Border.all(color: AppColors.divider),
                                  ),
                                  child: QrImageView(
                                    data: code,
                                    version: QrVersions.auto,
                                    size: 240,
                                    foregroundColor: AppColors.text,
                                  ),
                                ),
                                const SizedBox(height: 18),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 18,
                                    vertical: 16,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.primarySoft,
                                    borderRadius: BorderRadius.circular(22),
                                  ),
                                  child: Text(
                                    code,
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.outfit(
                                      fontSize: 24,
                                      letterSpacing: 6,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.text,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );

                          final sidePanel = Column(
                            children: [
                              _SurfaceCard(
                                padding: const EdgeInsets.all(22),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const _TinyLabel('Como funciona'),
                                    const SizedBox(height: 12),
                                    ...[
                                      'Elige tus cupones favoritos antes de pedir.',
                                      'Activa los que quieras usar en tu siguiente cuenta.',
                                      'En caja o mesa, muestra este codigo para validarlos.',
                                    ].map(
                                      (step) => Padding(
                                        padding: const EdgeInsets.only(bottom: 12),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              margin: const EdgeInsets.only(top: 2),
                                              width: 10,
                                              height: 10,
                                              decoration: const BoxDecoration(
                                                color: AppColors.primary,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Text(
                                                step,
                                                style: GoogleFonts.outfit(
                                                  fontSize: 14,
                                                  height: 1.5,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.text,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                              _RequestedSummary(firebase: firebase, userId: userId),
                            ],
                          );

                          if (wide) {
                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(flex: 6, child: qrPanel),
                                const SizedBox(width: 18),
                                Expanded(flex: 4, child: sidePanel),
                              ],
                            );
                          }

                          return Column(
                            children: [
                              qrPanel,
                              const SizedBox(height: 16),
                              sidePanel,
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _CuentaTab extends StatefulWidget {
  final String userId;
  final FirebaseService firebase;

  const _CuentaTab({required this.userId, required this.firebase});

  @override
  State<_CuentaTab> createState() => _CuentaTabState();
}

class _CuentaTabState extends State<_CuentaTab> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: StreamBuilder<List<ActiveBill>>(
          stream: widget.firebase.getAllBills(widget.userId),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final bills = snapshot.data!;

            if (bills.isEmpty) {
              return const Padding(
                padding: EdgeInsets.fromLTRB(20, 12, 20, 112),
                child: _EmptyState(
                  icon: LucideIcons.receipt,
                  title: 'Todavia no tienes cuentas',
                  copy: 'Cuando cierres tus consumos aqui veras el historial completo.',
                ),
              );
            }

            final totalSavings = bills.fold<double>(0, (sum, bill) => sum + bill.savings);

            return SingleChildScrollView(
              padding: const EdgeInsets.only(top: 12, bottom: 112),
              child: appResponsiveFrame(
                context,
                Padding(
                  padding: appPagePadding(context),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _SurfaceCard(
                        color: const Color(0xFF261D45),
                        borderColor: const Color(0xFF261D45),
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const _TinyLabel(
                              'Historial VORAA',
                              color: Colors.white70,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Tus cuentas, ahorros y seguimiento en un solo lugar',
                              style: GoogleFonts.outfit(
                                fontSize: 30,
                                height: 1.05,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Has ahorrado \$${totalSavings.toInt()} con beneficios reales en restaurantes.',
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                height: 1.5,
                                fontWeight: FontWeight.w600,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final wide = constraints.maxWidth >= 700;
                          final children = [
                            _MiniMetricCard(
                              label: 'Cuentas',
                              value: '${bills.length}',
                              icon: LucideIcons.receipt,
                              color: AppColors.primary,
                              background: AppColors.primarySoft,
                            ),
                            _MiniMetricCard(
                              label: 'Ahorro',
                              value: '\$${totalSavings.toInt()}',
                              icon: LucideIcons.badgeDollarSign,
                              color: AppColors.success,
                              background: const Color(0xFFEFFBF2),
                            ),
                          ];

                          if (wide) {
                            return Row(
                              children: [
                                Expanded(child: children[0]),
                                const SizedBox(width: 14),
                                Expanded(child: children[1]),
                              ],
                            );
                          }

                          return Column(
                            children: [
                              children[0],
                              const SizedBox(height: 14),
                              children[1],
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 22),
                      const _SectionTitle(
                        eyebrow: 'Tus movimientos',
                        title: 'Detalle de cuentas',
                        copy:
                            'Consulta totales, descuentos y estado de cada consumo.',
                        compact: true,
                      ),
                      const SizedBox(height: 12),
                      ...bills.map(
                        (bill) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: _BillCard(
                            bill: bill,
                            onTap: () => _showBillDetailModal(context, bill),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showBillDetailModal(BuildContext context, ActiveBill bill) {
    final isClientReport = bill.status == 'reported' && bill.clientFeedback == 'negative';
    final effectiveStatus = bill.status == 'reported' && !isClientReport ? 'closed' : bill.status;
    final isWaitingFeedback = bill.status == 'waiting_client_feedback';

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FractionallySizedBox(
          heightFactor: 0.9,
          child: Container(
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
            ),
            child: SafeArea(
              top: false,
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
                child: appResponsiveFrame(
                  context,
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 42,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.divider,
                            borderRadius: BorderRadius.circular(99),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      _SurfaceCard(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              bill.venueName.toUpperCase(),
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2.2,
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '\$${bill.finalTotal.toInt()}',
                              style: GoogleFonts.outfit(
                                fontSize: 46,
                                height: 1,
                                fontWeight: FontWeight.w900,
                                color: AppColors.text,
                              ),
                            ),
                            const SizedBox(height: 8),
                            _StatusPill(
                              label: _getStatusLabel(effectiveStatus),
                              color: _getStatusColor(effectiveStatus),
                              background: _getStatusColor(effectiveStatus).withOpacity(0.12),
                            ),
                            const SizedBox(height: 18),
                            if (isWaitingFeedback) ...[
                              Text(
                                'Confirma como fue tu experiencia',
                                style: GoogleFonts.outfit(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.text,
                                ),
                              ),
                              const SizedBox(height: 14),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () async {
                                        await widget.firebase.confirmBill(bill, 'positive');
                                        if (!context.mounted) return;
                                        Navigator.of(context).pop();
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.success,
                                      ),
                                      child: const Text('Todo excelente'),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () {
                                        Navigator.of(context).pop();
                                        _showReportDialog(context, bill);
                                      },
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: AppColors.danger,
                                        side: const BorderSide(color: Color(0xFFF5C9CF)),
                                      ),
                                      child: const Text('Reportar'),
                                    ),
                                  ),
                                ],
                              ),
                            ] else if (isClientReport) ...[
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(18),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFF1F2),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: const Color(0xFFF9D2D7)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      LucideIcons.alertTriangle,
                                      color: AppColors.danger,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        'Tu caso ya fue enviado al equipo para revision.',
                                        style: GoogleFonts.outfit(
                                          fontSize: 14,
                                          height: 1.45,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.danger,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ] else ...[
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(18),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEFFBF2),
                                  borderRadius: BorderRadius.circular(24),
                                ),
                                child: Text(
                                  'Ahorro logrado: \$${bill.savings.toInt()}',
                                  style: GoogleFonts.outfit(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.success,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      _SurfaceCard(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const _TinyLabel('Detalle de consumo'),
                            const SizedBox(height: 14),
                            ...bill.items.map((item) {
                              final map = item as Map<String, dynamic>;
                              final name = map['name'] ?? 'Producto';
                              final quantity = map['quantity'] ?? 0;
                              final total = (map['total'] ?? 0).toDouble();

                              return Padding(
                                padding: const EdgeInsets.only(bottom: 14),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '$name x$quantity',
                                            style: GoogleFonts.outfit(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.text,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Consumo registrado',
                                            style: GoogleFonts.outfit(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '\$${total.toInt()}',
                                      style: GoogleFonts.outfit(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w900,
                                        color: AppColors.text,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const Divider(height: 32, color: AppColors.divider),
                            _DetailRow(
                              label: 'Subtotal',
                              value: '\$${bill.originalTotal.toInt()}',
                            ),
                            const SizedBox(height: 12),
                            _DetailRow(
                              label: 'Descuentos',
                              value: '-\$${bill.discountTotal.toInt()}',
                              valueColor: AppColors.success,
                            ),
                            const Divider(height: 32, color: AppColors.divider),
                            _DetailRow(
                              label: 'Total final',
                              value: '\$${bill.finalTotal.toInt()}',
                              valueColor: AppColors.primary,
                              large: true,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showReportDialog(BuildContext context, ActiveBill bill) {
    final controller = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Reportar problema'),
          content: TextField(
            controller: controller,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Describe lo ocurrido...',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                await widget.firebase.createReport(
                  billId: bill.id,
                  userId: widget.userId,
                  userName: bill.userName,
                  venueId: bill.venueId,
                  venueName: bill.venueName,
                  description: controller.text,
                  type: 'other',
                );
                await widget.firebase.confirmBill(bill, 'negative');
                if (!dialogContext.mounted) return;
                Navigator.of(dialogContext).pop();
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
              child: const Text('Enviar'),
            ),
          ],
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'open':
        return AppColors.warning;
      case 'waiting_client_feedback':
        return AppColors.primary;
      case 'closed':
        return AppColors.success;
      case 'reported':
        return AppColors.danger;
      default:
        return AppColors.textMuted;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'open':
        return 'Abierta';
      case 'waiting_client_feedback':
        return 'Pendiente';
      case 'closed':
        return 'Finalizada';
      case 'reported':
        return 'Reportada';
      default:
        return status;
    }
  }
}

class _PerfilTab extends StatelessWidget {
  final String userId;
  final FirebaseService firebase;

  const _PerfilTab({required this.userId, required this.firebase});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: StreamBuilder<UserProfile>(
          stream: firebase.getUserProfile(userId),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final user = snapshot.data!;

            return SingleChildScrollView(
              padding: const EdgeInsets.only(top: 12, bottom: 112),
              child: appResponsiveFrame(
                context,
                Padding(
                  padding: appPagePadding(context),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _SurfaceCard(
                        color: const Color(0xFF251B42),
                        borderColor: const Color(0xFF251B42),
                        padding: const EdgeInsets.all(24),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final wide = constraints.maxWidth >= 760;

                            final avatar = CircleAvatar(
                              radius: 42,
                              backgroundColor: Colors.white,
                              child: Text(
                                user.name.isEmpty ? 'V' : user.name.substring(0, 1).toUpperCase(),
                                style: GoogleFonts.outfit(
                                  fontSize: 34,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                ),
                              ),
                            );

                            final info = Column(
                              crossAxisAlignment: wide
                                  ? CrossAxisAlignment.start
                                  : CrossAxisAlignment.center,
                              children: [
                                Text(
                                  user.name,
                                  textAlign: wide ? TextAlign.left : TextAlign.center,
                                  style: GoogleFonts.outfit(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  user.email,
                                  textAlign: wide ? TextAlign.left : TextAlign.center,
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white70,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(999),
                                    border: Border.all(color: Colors.white.withOpacity(0.12)),
                                  ),
                                  child: Text(
                                    user.frequentLevel.toUpperCase(),
                                    style: GoogleFonts.outfit(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.6,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            );

                            if (wide) {
                              return Row(
                                children: [
                                  avatar,
                                  const SizedBox(width: 18),
                                  Expanded(child: info),
                                ],
                              );
                            }

                            return Column(
                              children: [
                                avatar,
                                const SizedBox(height: 16),
                                info,
                              ],
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final wide = constraints.maxWidth >= 720;

                          final first = _MiniMetricCard(
                            label: 'Ahorro total',
                            value: '\$${user.totalSavings.toInt()}',
                            icon: LucideIcons.badgeDollarSign,
                            color: AppColors.success,
                            background: const Color(0xFFEFFBF2),
                          );
                          final second = _MiniMetricCard(
                            label: 'Interacciones',
                            value: '${user.positiveInteractions}',
                            icon: LucideIcons.star,
                            color: const Color(0xFFF97316),
                            background: const Color(0xFFFFF3E8),
                          );

                          if (wide) {
                            return Row(
                              children: [
                                Expanded(child: first),
                                const SizedBox(width: 14),
                                Expanded(child: second),
                              ],
                            );
                          }

                          return Column(
                            children: [
                              first,
                              const SizedBox(height: 14),
                              second,
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      const _SectionTitle(
                        eyebrow: 'Tus casos',
                        title: 'Reportes y seguimiento',
                        copy:
                            'Aqui puedes revisar si algun caso sigue abierto o ya fue resuelto.',
                        compact: true,
                      ),
                      const SizedBox(height: 12),
                      StreamBuilder<List<FrictionCase>>(
                        stream: firebase.getMyReports(userId),
                        builder: (context, reportsSnapshot) {
                          final reports = reportsSnapshot.data ?? [];

                          if (reports.isEmpty) {
                            return const _EmptyState(
                              icon: LucideIcons.shieldCheck,
                              title: 'No tienes reportes activos',
                              copy: 'Todo se ve bien por aqui.',
                            );
                          }

                          return Column(
                            children: reports
                                .map((report) => Padding(
                                      padding: const EdgeInsets.only(bottom: 14),
                                      child: _ReportCard(report: report),
                                    ))
                                .toList(),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _HomeHero extends StatelessWidget {
  final UserProfile? user;

  const _HomeHero({required this.user});

  @override
  Widget build(BuildContext context) {
    final firstName = (user?.name ?? 'Invitado').split(' ').first;
    final savings = user?.totalSavings.toInt() ?? 0;

    return _SurfaceCard(
      padding: const EdgeInsets.all(18),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 860;

          final textBlock = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _TinyLabel('Experiencia gastronomica'),
              const SizedBox(height: 10),
              Text(
                'Hola, $firstName',
                style: GoogleFonts.outfit(
                  fontSize: 34,
                  height: 1.02,
                  fontWeight: FontWeight.w900,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Descubre promos de comida pensadas para usarse de verdad, sin ruido visual ni pasos de mas.',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  height: 1.55,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 18),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _ChipBadge(
                    icon: LucideIcons.badgeDollarSign,
                    label: 'Ahorraste \$${savings} este mes',
                  ),
                  const _ChipBadge(
                    icon: LucideIcons.utensilsCrossed,
                    label: 'Promos en restaurantes reales',
                  ),
                ],
              ),
            ],
          );

          final imageBlock = ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: SizedBox(
              height: wide ? 260 : 220,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200',
                    fit: BoxFit.cover,
                  ),
                  Align(
                    alignment: Alignment.bottomLeft,
                    child: Container(
                      margin: const EdgeInsets.all(14),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const _TinyLabel('Selecciones del dia'),
                          const SizedBox(height: 4),
                          Text(
                            'Cafes, brunch y cenas con beneficio listo',
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.text,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );

          if (wide) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(flex: 11, child: textBlock),
                const SizedBox(width: 18),
                Expanded(flex: 10, child: imageBlock),
              ],
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              imageBlock,
              const SizedBox(height: 18),
              textBlock,
            ],
          );
        },
      ),
    );
  }
}

class _CouponCard extends StatelessWidget {
  final Coupon coupon;
  final VoidCallback onSave;

  const _CouponCard({required this.coupon, required this.onSave});

  @override
  Widget build(BuildContext context) {
    return _SurfaceCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
            child: Image.network(
              coupon.imageUrl,
              height: 178,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 178,
                color: AppColors.primarySoft,
                child: const Center(
                  child: Icon(
                    LucideIcons.image,
                    color: AppColors.primary,
                    size: 34,
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _TinyLabel(coupon.venueName.toUpperCase()),
                const SizedBox(height: 8),
                Text(
                  coupon.title,
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    height: 1.08,
                    fontWeight: FontWeight.w900,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  coupon.description,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    height: 1.5,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _StatusPill(
                        label: _couponBenefitLabel(coupon),
                        color: AppColors.primary,
                        background: AppColors.primarySoft,
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: onSave,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(0, 48),
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        backgroundColor: AppColors.text,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18),
                        ),
                      ),
                      child: const Text('Guardar'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _couponBenefitLabel(Coupon coupon) {
    switch (coupon.discountType) {
      case 'percentage':
        return '${coupon.discountValue.toInt()}% off';
      case 'fixed':
        return '\$${coupon.discountValue.toInt()} de ahorro';
      default:
        return 'Promo especial';
    }
  }
}

class _RequestedSummary extends StatelessWidget {
  final FirebaseService firebase;
  final String userId;

  const _RequestedSummary({required this.firebase, required this.userId});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: firebase.getSavedCoupons(userId),
      builder: (context, snapshot) {
        final redeemable = (snapshot.data ?? []).where(_isRedeemableCoupon).toList();
        final requested = redeemable.length;

        return GestureDetector(
          onTap: () => _showRedeemableCoupons(context, redeemable),
          onDoubleTap: () => _showRedeemableCoupons(context, redeemable),
          child: _SurfaceCard(
            padding: const EdgeInsets.all(22),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: requested > 0 ? AppColors.primarySoft : const Color(0xFFF4F1FA),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Icon(
                    requested > 0 ? LucideIcons.checkCircle2 : LucideIcons.alertCircle,
                    color: requested > 0 ? AppColors.primary : AppColors.textMuted,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _TinyLabel('Estado actual'),
                      const SizedBox(height: 6),
                      Text(
                        requested > 0
                            ? '$requested beneficios listos para usar'
                            : 'Aun no tienes cupones activos',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          height: 1.35,
                          fontWeight: FontWeight.w800,
                          color: AppColors.text,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Icon(
                  LucideIcons.chevronRight,
                  color: requested > 0 ? AppColors.primary : AppColors.textMuted,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  bool _isRedeemableCoupon(Map<String, dynamic> item) {
    final savedData = item['savedData'] as Map<String, dynamic>?;
    final status = savedData?['status'] as String?;
    return status == 'requested' || status == 'accepted';
  }

  void _showRedeemableCoupons(BuildContext context, List<Map<String, dynamic>> redeemable) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FractionallySizedBox(
          heightFactor: 0.72,
          child: Container(
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(34)),
            ),
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
                child: appResponsiveFrame(
                  context,
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 42,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.divider,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const _TinyLabel('Cupones a redimir'),
                      const SizedBox(height: 8),
                      Text(
                        redeemable.isEmpty
                            ? 'No hay beneficios activos'
                            : '${redeemable.length} beneficios seleccionados',
                        style: GoogleFonts.outfit(
                          fontSize: 28,
                          height: 1.05,
                          fontWeight: FontWeight.w900,
                          color: AppColors.text,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Expanded(
                        child: redeemable.isEmpty
                            ? const _EmptyState(
                                icon: LucideIcons.ticket,
                                title: 'Sin cupones seleccionados',
                                copy:
                                    'Activa un cupon desde Guardados para que aparezca aqui y en el scanner del restaurante.',
                              )
                            : ListView.separated(
                                itemCount: redeemable.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  final item = redeemable[index];
                                  final coupon = item['coupon'] as Coupon;
                                  final savedData =
                                      item['savedData'] as Map<String, dynamic>;
                                  final status = savedData['status'] as String? ?? 'requested';

                                  return _RedeemableCouponTile(
                                    coupon: coupon,
                                    status: status,
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _RedeemableCouponTile extends StatelessWidget {
  final Coupon coupon;
  final String status;

  const _RedeemableCouponTile({
    required this.coupon,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final accepted = status == 'accepted';

    return _SurfaceCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Image.network(
              coupon.imageUrl,
              width: 74,
              height: 74,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 74,
                height: 74,
                color: AppColors.primarySoft,
                child: const Icon(
                  LucideIcons.ticket,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _TinyLabel(coupon.venueName.toUpperCase()),
                const SizedBox(height: 6),
                Text(
                  coupon.title,
                  style: GoogleFonts.outfit(
                    fontSize: 17,
                    height: 1.15,
                    fontWeight: FontWeight.w900,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  coupon.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    height: 1.35,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _StatusPill(
                      label: _benefitLabel(coupon),
                      color: AppColors.primary,
                      background: AppColors.primarySoft,
                    ),
                    _StatusPill(
                      label: accepted ? 'En cuenta' : 'Listo',
                      color: accepted ? AppColors.success : AppColors.primary,
                      background:
                          accepted ? const Color(0xFFEFFBF2) : AppColors.primarySoft,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _benefitLabel(Coupon coupon) {
    switch (coupon.discountType) {
      case 'percentage':
        return '${coupon.discountValue.toInt()}% off';
      case 'fixed':
        return '\$${coupon.discountValue.toInt()} de ahorro';
      default:
        return 'Promo especial';
    }
  }
}

class _BillCard extends StatelessWidget {
  final ActiveBill bill;
  final VoidCallback onTap;

  const _BillCard({required this.bill, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isClientReport = bill.status == 'reported' && bill.clientFeedback == 'negative';
    final effectiveStatus = bill.status == 'reported' && !isClientReport ? 'closed' : bill.status;
    final statusColor = _statusColor(effectiveStatus);
    final statusBackground = statusColor.withOpacity(0.12);
    final icon = effectiveStatus == 'open' ? LucideIcons.clock3 : LucideIcons.receipt;
    final date = bill.createdAt.toDate();

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: _SurfaceCard(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: statusBackground,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(icon, color: statusColor),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    bill.venueName,
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${date.day}/${date.month}/${date.year}  |  #${bill.id.split('_').last}',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '\$${bill.finalTotal.toInt()}',
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 6),
                _StatusPill(
                  label: _statusLabel(effectiveStatus),
                  color: statusColor,
                  background: statusBackground,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static Color _statusColor(String status) {
    switch (status) {
      case 'open':
        return AppColors.warning;
      case 'waiting_client_feedback':
        return AppColors.primary;
      case 'closed':
        return AppColors.success;
      case 'reported':
        return AppColors.danger;
      default:
        return AppColors.textMuted;
    }
  }

  static String _statusLabel(String status) {
    switch (status) {
      case 'open':
        return 'Abierta';
      case 'waiting_client_feedback':
        return 'Pendiente';
      case 'closed':
        return 'Finalizada';
      case 'reported':
        return 'Reportada';
      default:
        return status;
    }
  }
}

class _ReportCard extends StatelessWidget {
  final FrictionCase report;

  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    final resolved = report.status == 'resolved';

    return _SurfaceCard(
      padding: EdgeInsets.zero,
      borderColor: resolved ? const Color(0xFFD4F2DE) : const Color(0xFFF7D5DA),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.fromLTRB(18, 10, 18, 10),
          childrenPadding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          leading: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: resolved ? const Color(0xFFEFFBF2) : const Color(0xFFFFF1F2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              resolved ? LucideIcons.shieldCheck : LucideIcons.shieldAlert,
              color: resolved ? AppColors.success : AppColors.danger,
            ),
          ),
          title: Text(
            report.venueName,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: AppColors.text,
            ),
          ),
          subtitle: Text(
            'Folio #${report.billId.split('_').last}',
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
          trailing: _StatusPill(
            label: resolved ? 'Resuelto' : 'Pendiente',
            color: resolved ? AppColors.success : AppColors.danger,
            background: resolved ? const Color(0xFFEFFBF2) : const Color(0xFFFFF1F2),
          ),
          children: [
            const Divider(height: 10, color: AppColors.divider),
            const SizedBox(height: 14),
            const _TinyLabel('Tu reporte'),
            const SizedBox(height: 8),
            Text(
              report.description,
              style: GoogleFonts.outfit(
                fontSize: 14,
                height: 1.5,
                fontWeight: FontWeight.w600,
                color: AppColors.text,
              ),
            ),
            if (report.adminNotes != null && report.adminNotes!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _TinyLabel('Respuesta del admin'),
                    const SizedBox(height: 6),
                    Text(
                      report.adminNotes!,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        height: 1.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.text,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MiniMetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final Color background;

  const _MiniMetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.background,
  });

  @override
  Widget build(BuildContext context) {
    return _SurfaceCard(
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _TinyLabel(label),
                const SizedBox(height: 6),
                Text(
                  value,
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: AppColors.text,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String copy;
  final bool compact;

  const _SectionTitle({
    required this.eyebrow,
    required this.title,
    required this.copy,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _TinyLabel(eyebrow),
        const SizedBox(height: 8),
        Text(
          title,
          style: GoogleFonts.outfit(
            fontSize: compact ? 26 : 34,
            height: 1.05,
            fontWeight: FontWeight.w900,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          copy,
          style: GoogleFonts.outfit(
            fontSize: 14,
            height: 1.55,
            fontWeight: FontWeight.w600,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}

class _SurfaceCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color color;
  final Color borderColor;

  const _SurfaceCard({
    required this.child,
    this.padding = const EdgeInsets.all(22),
    this.color = Colors.white,
    this.borderColor = AppColors.divider,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: borderColor),
        boxShadow: const [
          BoxShadow(
            color: Color(0x12000000),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: padding,
        child: child,
      ),
    );
  }
}

class _ChipBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _ChipBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F1FA),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String label;
  final Color color;
  final Color background;

  const _StatusPill({
    required this.label,
    required this.color,
    required this.background,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.6,
          color: color,
        ),
      ),
    );
  }
}

class _TinyLabel extends StatelessWidget {
  final String label;
  final Color color;

  const _TinyLabel(
    this.label, {
    this.color = AppColors.textMuted,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: GoogleFonts.outfit(
        fontSize: 11,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.8,
        color: color,
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  final bool large;

  const _DetailRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.large = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: AppColors.textMuted,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: large ? 26 : 18,
            fontWeight: FontWeight.w900,
            color: valueColor ?? AppColors.text,
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String copy;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.copy,
  });

  @override
  Widget build(BuildContext context) {
    return appResponsiveFrame(
      context,
      Center(
        child: Padding(
          padding: appPagePadding(context),
          child: _SurfaceCard(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    borderRadius: BorderRadius.circular(26),
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 32),
                ),
                const SizedBox(height: 18),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  copy,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    height: 1.55,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
