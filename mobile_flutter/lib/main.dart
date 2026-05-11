import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  _ensureFirebaseConfig();
  
  await Firebase.initializeApp(
    options: _firebaseOptions,
  );
  
  // Deshabilitar persistencia en web para evitar el error "Internal Assertion Failed"
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: false,
  );

  // Configurar Google Fonts para evitar búsquedas locales innecesarias que causan warnings en web
  GoogleFonts.config.allowRuntimeFetching = true;

  runApp(const SmartRedemptionApp());
}

const _firebaseOptions = FirebaseOptions(
  apiKey: String.fromEnvironment('FIREBASE_API_KEY'),
  appId: String.fromEnvironment('FIREBASE_APP_ID'),
  messagingSenderId: String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
  projectId: String.fromEnvironment('FIREBASE_PROJECT_ID'),
  authDomain: String.fromEnvironment('FIREBASE_AUTH_DOMAIN'),
  storageBucket: String.fromEnvironment('FIREBASE_STORAGE_BUCKET'),
  measurementId: String.fromEnvironment('FIREBASE_MEASUREMENT_ID'),
);

void _ensureFirebaseConfig() {
  const requiredValues = {
    'FIREBASE_API_KEY': String.fromEnvironment('FIREBASE_API_KEY'),
    'FIREBASE_APP_ID': String.fromEnvironment('FIREBASE_APP_ID'),
    'FIREBASE_MESSAGING_SENDER_ID': String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
    'FIREBASE_PROJECT_ID': String.fromEnvironment('FIREBASE_PROJECT_ID'),
  };

  final missing = requiredValues.entries
      .where((entry) => entry.value.isEmpty)
      .map((entry) => entry.key)
      .toList();

  if (missing.isNotEmpty) {
    throw StateError('Missing Firebase dart-defines: ${missing.join(', ')}');
  }
}

class SmartRedemptionApp extends StatelessWidget {
  const SmartRedemptionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Redemption Pass',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(),
      home: const LoginScreen(),
    );
  }
}
