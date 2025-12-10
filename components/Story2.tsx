import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    GestureResponderEvent,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, spacing, typography } from "../styles/indexStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============ DATA MEDIA DIAGNOSTICS ============
const STORY_DATA = {
  id: "2",
  author: "MedIA Diagnostics",
  location: "Montpellier, FR",
  avatar: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&h=150&fit=crop", // Logo/Avatar médical
  image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1200&fit=crop", // Ambiance Labo High-Tech
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", // Ambiance plus "Tech/Focus"
  time: "5h",
  tag: "HealthTech AI",
  metrics: {
    raised: 4200000, // 4.2 M€
    goal: 4500000,   // 4.5 M€
    investors: 2140,
    yield: 14.2,     // Rendement potentiel plus élevé (Tech)
    minEntry: 500,   // Ticket d'entrée plus élevé
  }
};

const DURATION = 15000; // 15 secondes

export default function StoryScreen2() {
  const router = useRouter();
  
  // Refs Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(50)).current;
  
  // Refs Logique
  const isNavigatingRef = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const touchStartX = useRef(0);

  // États
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // ============ LIFECYCLE & AUDIO ============
  useEffect(() => {
    loadMusic();
    startStory();
    animateContent();

    return () => {
      stopAndUnloadSound();
    };
  }, []);

  async function loadMusic() {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: playbackObject } = await Audio.Sound.createAsync(
        { uri: STORY_DATA.musicUrl },
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      soundRef.current = playbackObject;
    } catch (error) {
      console.log("Erreur audio", error);
    }
  }

  const stopAndUnloadSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }
  };

  const toggleMute = async () => {
    if (soundRef.current) {
      const newMutedState = !isMuted;
      await soundRef.current.setIsMutedAsync(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  // ============ ANIMATION ============
  const startStory = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isNavigatingRef.current) {
        stopAndUnloadSound();
        closeStory(); // Fin des stories -> on ferme
      }
    });
  };

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(contentFadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(contentSlideAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  // ============ TOUCH & GESTURES ============
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    pauseStory();
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    const touchEndX = e.nativeEvent.pageX;
    const distance = touchStartX.current - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe GAUCHE (Suivant) -> Pas de Story 3, donc on ferme
        closeStory();
      } else {
        // Swipe DROITE (Précédent) -> Retour Story 1
        goToPrevStory();
      }
    } else {
      resumeStory();
    }
  };

  const pauseStory = () => {
    if (isNavigatingRef.current) return;
    setIsPaused(true);
    progressAnim.stopAnimation();
  };

  const resumeStory = () => {
    if (isNavigatingRef.current) return;
    setIsPaused(false);
    const currentValue = (progressAnim as any)._value;
    const remainingTime = DURATION * (1 - currentValue);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingTime,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isNavigatingRef.current) {
        stopAndUnloadSound();
        closeStory();
      }
    });
  };

  // ============ NAVIGATION ============
  const closeStory = async () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    await stopAndUnloadSound();
    router.dismissAll(); // Retour à l'accueil
    // ou router.push("/") si dismissAll ne fonctionne pas selon votre stack
  };

  const goToPrevStory = async () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    progressAnim.stopAnimation();
    await stopAndUnloadSound();
    
    // ✅ RETOUR VERS STORY 1
    router.replace("/story1"); 
  };

  const handleInvest = async () => {
    isNavigatingRef.current = true;
    progressAnim.stopAnimation();
    await stopAndUnloadSound();
    router.push("/projet2"); // Assurez-vous d'avoir une page projet2 ou redirigez vers projet1 pour tester
  };

  // 📊 CALCULS (4.2M / 4.5M = 93.3%)
  const percentRaised = Math.min((STORY_DATA.metrics.raised / STORY_DATA.metrics.goal) * 100, 100);
  const remainingAmount = STORY_DATA.metrics.goal - STORY_DATA.metrics.raised;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M€"; // 4.2M€
    return Math.floor(value / 1000) + "k€";
  };

  return (
    <View 
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* FOND */}
      <Image source={{ uri: STORY_DATA.image }} style={styles.backgroundImage} resizeMode="cover" />
      
      <LinearGradient
        // Ambiance plus "Bleue/froide" pour le médical
        colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,50,100,0.4)", "#0f172a"]}
        locations={[0, 0.2, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        
        {/* BARRE PROGRESSION */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.authorRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: STORY_DATA.avatar }} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={8} color={colors.white} />
              </View>
            </View>
            <View>
              <Text style={styles.authorName}>{STORY_DATA.author}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.time}>{STORY_DATA.location}</Text>
                <View style={styles.dot} />
                <Text style={styles.time}>{STORY_DATA.time}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rightControls}>
            <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
               <Feather name={isMuted ? "volume-x" : "volume-2"} size={20} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={closeStory} style={styles.iconButton}>
              <Feather name="x" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} pointerEvents="box-none">
          <Animated.View 
            style={{ 
              opacity: contentFadeAnim,
              transform: [{ translateY: contentSlideAnim }] 
            }}
          >
            {/* BADGE TECH */}
            <View style={styles.techTag}>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]} // Bleu tech
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.techGradient}
              >
                <Feather name="cpu" size={14} color={colors.white} />
                <Text style={styles.techText}>Percée IA Validée</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>L'IA de diagnostic franchit la barre des 4M€ 🧬</Text>

            {/* CARTE FINANCIÈRE (93%) */}
            <View style={styles.financeCard}>
              <View style={styles.financeHeader}>
                <View>
                  <Text style={styles.financeLabel}>Objectif levée</Text>
                  <View style={styles.financeValueRow}>
                    <Text style={styles.financeValue}>
                      {formatCurrency(STORY_DATA.metrics.raised)}
                    </Text>
                    <Text style={styles.financeTarget}>
                      / {formatCurrency(STORY_DATA.metrics.goal)}
                    </Text>
                  </View>
                </View>
                <View style={styles.investorBadge}>
                  <Feather name="users" size={12} color="#60A5FA" />
                  <Text style={styles.investorCount}>{STORY_DATA.metrics.investors}</Text>
                </View>
              </View>

              <View style={styles.fundingBarContainer}>
                {/* Barre plus remplie (93%) */}
                <View style={[styles.fundingBarFill, { width: `${percentRaised}%`, backgroundColor: "#3B82F6" }]} />
              </View>
              <View style={styles.fundingMeta}>
                <Text style={[styles.fundingMetaText, { color: "#93C5FD" }]}>{percentRaised.toFixed(1)}% financé</Text>
                <Text style={[styles.fundingMetaText, { color: colors.white }]}>
                  Derniers {formatCurrency(remainingAmount)}
                </Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={handleInvest}
              style={{ marginBottom: spacing.md }}
            >
              <View style={styles.ctaButton}>
                <LinearGradient
                  colors={["#2563EB", "#1E40AF"]} // Bleu plus profond
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.ctaContent}>
                  <View>
                    <Text style={styles.ctaTitle}>Rejoindre le tour</Text>
                    <Text style={styles.ctaSubtitle}>Ticket d'entrée dès {STORY_DATA.metrics.minEntry}€</Text>
                  </View>
                  <View style={styles.ctaIconBg}>
                    <Feather name="arrow-right" size={20} color="#1E40AF" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" }, // Fond plus sombre/bleuté
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 0, zIndex: 2 },
  
  progressBarContainer: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, marginBottom: spacing.md },
  progressBarBackground: { height: 3, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: radius.full, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: colors.white, borderRadius: radius.full },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  authorRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatarContainer: { position: 'relative' },
  avatar: { width: 36, height: 36, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.white },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: "#3B82F6", borderRadius: radius.full, width: 14, height: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.white },
  authorName: { color: colors.white, fontWeight: typography.fontWeightBold, fontSize: typography.fontSizeSm, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  time: { color: "rgba(255,255,255,0.8)", fontSize: typography.fontSizeXs },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.5)", marginHorizontal: 6 },
  
  rightControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconButton: { padding: 4 },

  footer: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 50 : 40 },
  
  // Style spécifique Tech
  techTag: { alignSelf: 'flex-start', borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.sm },
  techGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6 },
  techText: { color: colors.white, fontWeight: typography.fontWeightBold, fontSize: typography.fontSizeXs, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  title: { color: colors.white, fontSize: 26, fontWeight: typography.fontWeightBlack, marginBottom: spacing.lg, lineHeight: 32, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  
  financeCard: { backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.xl, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.3)", ...shadows.lg },
  financeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  financeLabel: { color: "#94A3B8", fontSize: typography.fontSizeXs, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  financeValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  financeValue: { color: colors.white, fontSize: typography.fontSizeXl, fontWeight: typography.fontWeightBold },
  financeTarget: { color: "#94A3B8", fontSize: typography.fontSizeMd, marginBottom: 3 },
  investorBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: "rgba(59, 130, 246, 0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.3)" },
  investorCount: { color: "#60A5FA", fontSize: typography.fontSizeXs, fontWeight: typography.fontWeightBold },
  
  fundingBarContainer: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radius.full, marginBottom: spacing.xs, overflow: 'hidden' },
  fundingBarFill: { height: '100%', borderRadius: radius.full },
  fundingMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  fundingMetaText: { fontSize: 10, fontWeight: typography.fontWeightMedium },
  
  ctaButton: { borderRadius: radius.xl, overflow: 'hidden', height: 60, ...shadows.glow },
  ctaContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  ctaTitle: { color: colors.white, fontSize: typography.fontSizeMd, fontWeight: typography.fontWeightBold },
  ctaSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: typography.fontSizeXs },
  ctaIconBg: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});