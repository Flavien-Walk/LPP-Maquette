// app/live3.tsx - Demo Produit : IA Diagnostic - MedIA Diagnostics
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, spacing } from "../styles/indexStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES ============
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface SpecItem {
  label: string;
  value: string;
  icon: string;
}

// ============ MOCK DATA ============
const FEATURES_PREVIEW: Feature[] = [
  {
    id: "1",
    title: "Analyse Temps Réel",
    description: "Diagnostic assisté par IA en moins de 2 secondes.",
    icon: "zap",
  },
  {
    id: "2",
    title: "Précision Médicale",
    description: "Taux de détection validé cliniquement à 99.8%.",
    icon: "activity",
  },
  {
    id: "3",
    title: "Sécurité & RGPD",
    description: "Chiffrement de bout en bout des données patients.",
    icon: "shield",
  },
];

const TECH_SPECS: SpecItem[] = [
  { label: "Modèle", value: "GPT-4 Med", icon: "cpu" },
  { label: "Vitesse", value: "< 200ms", icon: "clock" },
  { label: "Dataset", value: "5M+ Images", icon: "database" },
  { label: "Compliance", value: "HDS / HIPAA", icon: "file-text" },
];

// ============ ANIMATED COMPONENTS ============

// Badge "LIVE DEMO"
const LiveDemoBadge: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.scheduledBadge, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.scheduledBadgeGradient}
      >
        <Feather name="layers" size={12} color={colors.white} />
        <Text style={styles.scheduledBadgeText}>DEMO PRODUIT</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Countdown Timer (Cible: Vendredi prochain 20h00)
const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 4, minutes: 12, seconds: 45 });
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        return { days, hours, minutes, seconds };
      });
      
      Animated.sequence([
        Animated.timing(flipAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const TimeBlock: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <View style={styles.countdownBlock}>
      <View style={styles.countdownBlockBg}>
        <Animated.Text
          style={[
            styles.countdownNumber,
            { transform: [{ scale: flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] },
          ]}
        >
          {value}
        </Animated.Text>
      </View>
      <Text style={styles.countdownUnit}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.countdownContainer}>
        <View style={styles.countdownHeader}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={styles.countdownLabel}>Lancement dans</Text>
        </View>
        <View style={styles.countdownTimer}>
          <TimeBlock value={formatNumber(timeLeft.days)} label="jours" />
          <Text style={styles.countdownSeparator}>:</Text>
          <TimeBlock value={formatNumber(timeLeft.hours)} label="heures" />
          <Text style={styles.countdownSeparator}>:</Text>
          <TimeBlock value={formatNumber(timeLeft.minutes)} label="min" />
          <Text style={styles.countdownSeparator}>:</Text>
          <TimeBlock value={formatNumber(timeLeft.seconds)} label="sec" />
        </View>
    </View>
  );
};

// Emoji flottant
const FloatingEmoji: React.FC<{ emoji: string; onComplete: () => void }> = ({ emoji, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  const randomX = Math.random() * 60 - 30;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -350, duration: 3000, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: randomX, duration: 3000, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingEmoji,
        {
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={styles.floatingEmojiText}>{emoji}</Text>
    </Animated.View>
  );
};

const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({
  children,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// ============ MAIN COMPONENT ============
const Live3: React.FC = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // États
  const [isRegistered, setIsRegistered] = useState(false);
  const [interested, setInterested] = useState(276);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string }[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [pollVoted, setPollVoted] = useState<number | null>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleBack = () => router.back();

  const handleRegister = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
    ]).start();

    setIsRegistered(!isRegistered);
    setInterested(isRegistered ? interested - 1 : interested + 1);
    if (!isRegistered) {
      addFloatingReaction("🚀");
      addFloatingReaction("🧪");
    }
  };

  const handleNotification = () => {
    setNotificationEnabled(!notificationEnabled);
    addFloatingReaction(notificationEnabled ? "🔕" : "🔔");
  };

  const addFloatingReaction = (emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingReactions((prev) => [...prev, { id, emoji }]);
  };

  const removeFloatingReaction = (id: string) => {
    setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleShare = () => {
    addFloatingReaction("📤");
  };

  const handlePollVote = (index: number) => {
    if (pollVoted === null) {
        setPollVoted(index);
        addFloatingReaction("📊");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} translucent />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Redescendu */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LiveDemoBadge />
            <View style={styles.interestedBadge}>
              <Feather name="users" size={13} color={colors.textSecondary} />
              <Text style={styles.interestedText}>{interested}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
            <Feather name="share-2" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Floating Reactions Container */}
        <View style={styles.floatingReactionsContainer} pointerEvents="none">
          {floatingReactions.map((reaction) => (
            <FloatingEmoji
              key={reaction.id}
              emoji={reaction.emoji}
              onComplete={() => removeFloatingReaction(reaction.id)}
            />
          ))}
        </View>

        <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Startup Info Card */}
            <AnimatedCard delay={100} style={styles.startupCard}>
              <View style={styles.startupHeader}>
                <View style={styles.startupAvatarContainer}>
                  <Image
                    source={{ uri: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop" }}
                    style={styles.startupAvatar}
                  />
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color={colors.white} />
                  </View>
                </View>
                <View style={styles.startupInfo}>
                  <Text style={styles.startupName}>MedIA Diagnostics</Text>
                  <View style={styles.startupTagsRow}>
                    <View style={[styles.startupTag, { backgroundColor: colors.successLight }]}>
                      <Text style={[styles.startupTagText, { color: colors.successDark }]}>HealthTech</Text>
                    </View>
                    <View style={[styles.startupTag, { backgroundColor: colors.accentLight }]}>
                      <Text style={[styles.startupTagText, { color: colors.accentDark }]}>AI</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.eventTitle}>Demo Produit :{"\n"}IA Diagnostic V2.0</Text>

              <View style={styles.eventMetaRow}>
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <Feather name="calendar" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.eventMetaText}>Vendredi, 20h00</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <Feather name="clock" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.eventMetaText}>~45 min</Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Countdown */}
            <AnimatedCard delay={200}>
                <CountdownTimer />
            </AnimatedCard>

             {/* Tech Specs (Specific to Demo) */}
             <AnimatedCard delay={300} style={styles.specsSection}>
                <View style={styles.sectionTitleRow}>
                    <Feather name="cpu" size={18} color={colors.textPrimary} />
                    <Text style={styles.sectionTitle}>Spécifications Techniques</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specsScroll}>
                    {TECH_SPECS.map((spec, index) => (
                        <View key={index} style={styles.specCard}>
                            <View style={styles.specIcon}>
                                <Feather name={spec.icon as any} size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.specValue}>{spec.value}</Text>
                            <Text style={styles.specLabel}>{spec.label}</Text>
                        </View>
                    ))}
                </ScrollView>
            </AnimatedCard>

            {/* Features Preview (Grid) */}
            <AnimatedCard delay={400} style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                    <Feather name="grid" size={18} color={colors.textPrimary} />
                    <Text style={styles.sectionTitle}>Fonctionnalités Présentées</Text>
                </View>
                <View style={styles.featuresGrid}>
                    {FEATURES_PREVIEW.map((feature) => (
                        <View key={feature.id} style={styles.featureItem}>
                            <View style={styles.featureIconContainer}>
                                <Feather name={feature.icon as any} size={20} color={colors.white} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </AnimatedCard>

            {/* Poll Section */}
            <AnimatedCard delay={500} style={styles.sectionCard}>
                 <View style={styles.sectionTitleRow}>
                    <Feather name="bar-chart-2" size={18} color={colors.textPrimary} />
                    <Text style={styles.sectionTitle}>Sondage Pré-Live</Text>
                </View>
                <Text style={styles.pollQuestion}>Quel aspect vous intéresse le plus ?</Text>
                <View style={styles.pollContainer}>
                    {[
                        { label: "Rapidité d'analyse", percent: 45 },
                        { label: "Intégration API", percent: 30 },
                        { label: "Certification Médicale", percent: 25 }
                    ].map((option, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.pollOption, 
                                pollVoted === index && styles.pollOptionSelected
                            ]}
                            onPress={() => handlePollVote(index)}
                            disabled={pollVoted !== null}
                            activeOpacity={0.8}
                        >
                            <View style={styles.pollLabelRow}>
                                <Text style={[
                                    styles.pollOptionText,
                                    pollVoted === index && styles.pollOptionTextSelected
                                ]}>{option.label}</Text>
                                {pollVoted !== null && (
                                    <Text style={[
                                        styles.pollPercentText,
                                        pollVoted === index && styles.pollPercentTextSelected
                                    ]}>{option.percent}%</Text>
                                )}
                            </View>
                            {pollVoted !== null && (
                                <View style={styles.pollBarBg}>
                                    <View style={[styles.pollBarFill, { width: `${option.percent}%` }]} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </AnimatedCard>
           
            {/* Bottom Spacing */}
            <View style={{ height: 140 }} />
        </ScrollView>

        {/* Bottom Actions - Specific to Product Launch (Beta Access) */}
        <View style={styles.bottomActions}>
            <View style={styles.betaInfo}>
                <Feather name="info" size={14} color={colors.textSecondary} />
                <Text style={styles.betaInfoText}>Places limitées pour l'accès Beta (50/100)</Text>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.notificationButton, notificationEnabled && styles.notificationButtonActive]}
                onPress={handleNotification}
                activeOpacity={0.7}
              >
                <Feather
                  name={notificationEnabled ? "bell" : "bell-off"}
                  size={20}
                  color={notificationEnabled ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>

              <Animated.View style={[styles.registerButtonContainer, { transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.8} style={styles.registerButton}>
                  <LinearGradient
                    colors={isRegistered ? [colors.success, colors.successDark] : [colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerButtonGradient}
                  >
                    <Feather
                      name={isRegistered ? "check-circle" : "key"}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.registerButtonText}>
                      {isRegistered ? "Accès Beta Demandé" : "Demander Accès Beta"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
      </SafeAreaView>
    </View>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  // Header Redescendu
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 20, 
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  // Demo Badge
  scheduledBadge: {
    borderRadius: radius.full,
    overflow: "hidden",
    ...shadows.sm,
  },
  scheduledBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.xs,
  },
  scheduledBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  interestedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  interestedText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  // Floating Reactions
  floatingReactionsContainer: {
    position: "absolute",
    right: spacing.xl,
    bottom: 220,
    width: 60,
    height: 350,
    zIndex: 100,
  },
  floatingEmoji: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  floatingEmojiText: {
    fontSize: 32,
  },

  // Startup Card
  startupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    ...shadows.md,
  },
  startupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  startupAvatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  startupAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  startupInfo: {
    flex: 1,
  },
  startupName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  startupTagsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  startupTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  startupTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: spacing.lg,
  },
  eventMetaRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  eventMetaIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  eventMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // Countdown
  countdownContainer: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  countdownLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  countdownTimer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  countdownBlock: {
    alignItems: "center",
  },
  countdownBlockBg: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  countdownUnit: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },
  countdownSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral300,
    marginBottom: 16,
  },

  // Specs Section
  specsSection: {
    marginBottom: spacing.lg,
  },
  specsScroll: {
    paddingLeft: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  specCard: {
    width: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    ...shadows.sm,
  },
  specIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  specLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Section Shared
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  // Features Grid
  featuresGrid: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.neutral50,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Poll
  pollQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  pollContainer: {
    gap: spacing.sm,
  },
  pollOption: {
    backgroundColor: colors.neutral50,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    position: "relative",
  },
  pollOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pollLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  pollOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  pollOptionTextSelected: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  pollPercentText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  pollPercentTextSelected: {
    color: colors.primary,
  },
  pollBarBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
  },
  pollBarFill: {
    height: "100%",
    backgroundColor: "rgba(0, 82, 255, 0.1)", // Primary with opacity
  },

  // Bottom Actions
  bottomActions: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.lg,
    ...shadows.md,
  },
  betaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  betaInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  notificationButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButtonActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  registerButtonContainer: {
    flex: 1,
  },
  registerButton: {
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: spacing.sm,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Live3;