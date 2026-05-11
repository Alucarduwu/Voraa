import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isWide = isWideLayout(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          Positioned(
            top: -80,
            right: -60,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                color: AppColors.primarySoft,
                borderRadius: BorderRadius.circular(80),
              ),
            ),
          ),
          Positioned(
            bottom: -70,
            left: -40,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(60),
                border: Border.all(color: AppColors.divider),
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 980),
                  child: isWide
                      ? Row(
                          children: [
                            Expanded(child: _buildIntro(context)),
                            const SizedBox(width: 24),
                            Expanded(child: _buildCard(context)),
                          ],
                        )
                      : Column(
                          children: [
                            _buildIntro(context),
                            const SizedBox(height: 20),
                            _buildCard(context),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntro(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        color: Colors.white,
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 74,
            height: 74,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(26),
            ),
            child: const Icon(Icons.restaurant_menu_rounded, color: Colors.white, size: 38),
          ),
          const SizedBox(height: 24),
          Text(
            'VORAA Mobile',
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
              letterSpacing: 1.8,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Beneficios gastronomicos con una experiencia mas elegante.',
            style: GoogleFonts.outfit(
              fontSize: 36,
              height: 1.05,
              fontWeight: FontWeight.w900,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Un look mas premium en blanco y morado, optimizado para movil y tambien mucho mejor en pantallas grandes.',
            style: GoogleFonts.outfit(
              fontSize: 15,
              height: 1.55,
              fontWeight: FontWeight.w500,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              _FeatureChip(label: 'Responsive'),
              _FeatureChip(label: 'Food first'),
              _FeatureChip(label: 'White + purple'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Elegir perfil',
            style: GoogleFonts.outfit(
              fontSize: 30,
              fontWeight: FontWeight.w900,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Entra al flujo del cliente para revisar cupones, QR, historial y reportes.',
            style: GoogleFonts.outfit(
              fontSize: 14,
              height: 1.5,
              color: AppColors.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 24),
          _loginButton(
            context,
            name: 'Ana Lopez',
            subtitle: 'Cliente demo',
            id: 'demo-client-1',
            icon: Icons.local_cafe_rounded,
          ),
          const SizedBox(height: 14),
          _loginButton(
            context,
            name: 'Staff Cafe',
            subtitle: 'Vista de restaurante',
            id: 'demo-restaurant-1',
            icon: Icons.storefront_rounded,
          ),
          const SizedBox(height: 14),
          _loginButton(
            context,
            name: 'Admin VORAA',
            subtitle: 'Revision operativa',
            id: 'demo-admin-1',
            icon: Icons.shield_rounded,
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              'Sistema seguro de lealtad · 2026',
              style: GoogleFonts.outfit(
                fontSize: 11,
                letterSpacing: 1.0,
                color: AppColors.textMuted,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _loginButton(
    BuildContext context, {
    required String name,
    required String subtitle,
    required String id,
    required IconData icon,
  }) {
    return InkWell(
      onTap: () => Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => HomeScreen(userId: id)),
      ),
      borderRadius: BorderRadius.circular(24),
      child: Ink(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: AppColors.primarySoft,
          border: Border.all(color: AppColors.divider),
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: GoogleFonts.outfit(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_rounded, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final String label;
  const _FeatureChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: AppColors.primary,
        ),
      ),
    );
  }
}
