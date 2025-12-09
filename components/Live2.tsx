// app/live2.tsx - Q&A Investisseurs - Bilan S1 2024
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, spacing } from "../styles/indexStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES ============
interface Question {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
  upvotes: number;
  isAnswered: boolean;
}

interface AgendaItem {
  id: string;
  title: string;
  duration: string;
  icon: string;
}

interface MetricItem {
  label: string;
  value: string;
  trend: string;
  positive: boolean;
  icon: string;
}

// ============ MOCK DATA ============
const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    author: "Pierre Durand",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "Quelle est votre stratégie d'expansion pour 2025 ?",
    timestamp: "Pré-enregistrée",
    upvotes: 47,
    isAnswered: false,
  },
  {
    id: "2",
    author: "Marie Lambert",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    text: "Pouvez-vous détailler la répartition du chiffre d'affaires par segment ?",
    timestamp: "Pré-enregistrée",
    upvotes: 34,
    isAnswered: false,
  },
  {
    id: "3",
    author: "Jean-Marc Petit",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    text: "Quels sont vos objectifs de rentabilité pour le S2 ?",
    timestamp: "Pré-enregistrée",
    upvotes: 28,
    isAnswered: false,
  },
];

const AGENDA_ITEMS: AgendaItem[] = [
  { id: "1", title: "Introduction & Mot du CEO", duration: "5 min", icon: "user" },
  { id: "2", title: "Présentation des résultats S1", duration: "15 min", icon: "bar-chart-2" },
  { id: "3", title: "Analyse par segment", duration: "10 min", icon: "pie-chart" },
  { id: "4", title: "Roadmap S2 2024", duration: "10 min", icon: "map" },
  { id: "5", title: "Session Q&A", duration: "20 min", icon: "help-circle" },
];

const KEY_METRICS: MetricItem[] = [
  { label: "CA S1 2024", value: "2.4M€", trend: "+32%", positive: true, icon: "dollar-sign" },
  { label: "Utilisateurs", value: "45K", trend: "+18%", positive: true, icon: "users" },
  { label: "MRR", value: "198K€", trend: "+25%", positive: true, icon: "trending-up" },
  { label: "Churn", value: "2.1%", trend: "-0.8%", positive: true, icon: "activity" },
];

// ============ ANIMATED COMPONENTS ============

// Badge "À VENIR"
const ScheduledBadge: React.FC = () => {
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
        colors={[colors.accent, colors.accentDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.scheduledBadgeGradient}
      >
        <View style={styles.scheduledDot} />
        <Text style={styles.scheduledBadgeText}>À VENIR</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Countdown Timer
const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
        setTimeLeft(newTimeLeft);

        Animated.sequence([
            Animated.timing(flipAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const TimeBlock: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <View style={styles.countdownBlock}>
      <View style={styles.countdownBlockBg}>
        <Animated.Text
          style={[
            styles.countdownNumber,
            { transform: [{ scale: flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] },
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
            <Feather name="clock" size={16} color={colors.accent} />
            <Text style={styles.countdownLabel}>Début du live dans</Text>
        </View>
        <View style={styles.countdownTimer}>
          {timeLeft.days > 0 && (
            <>
              <TimeBlock value={formatNumber(timeLeft.days)} label="jours" />
              <Text style={styles.countdownSeparator}>:</Text>
            </>
          )}
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
const Live2: React.FC = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // États
  const [isRegistered, setIsRegistered] = useState(false);
  const [showAgenda, setShowAgenda] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [interested, setInterested] = useState(189);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string }[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 30, 0, 0);

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
      addFloatingReaction("✅");
      addFloatingReaction("🎉");
    }
  };

  const handleNotification = () => {
    setNotificationEnabled(!notificationEnabled);
    addFloatingReaction(notificationEnabled ? "🔕" : "🔔");
  };

  const handleUpvote = (questionId: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
    addFloatingReaction("👍");
  };

  const handleSubmitQuestion = () => {
    if (question.trim()) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        author: "Vous",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        text: question,
        timestamp: "À l'instant",
        upvotes: 1,
        isAnswered: false,
      };
      setQuestions([newQuestion, ...questions]);
      setQuestion("");
      addFloatingReaction("❓");
    }
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

  return (
    <View style={styles.container}>
      {/* Barre d'état foncée pour fond clair */}
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} translucent />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Redescendu avec Padding Top */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <ScheduledBadge />
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
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
                    source={{ uri: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop" }}
                    style={styles.startupAvatar}
                  />
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color={colors.white} />
                  </View>
                </View>
                <View style={styles.startupInfo}>
                  <Text style={styles.startupName}>FinFlow Systems</Text>
                  <View style={styles.startupTagsRow}>
                    <View style={styles.startupTag}>
                      <Text style={styles.startupTagText}>FinTech</Text>
                    </View>
                    <View style={styles.startupTag}>
                      <Text style={styles.startupTagText}>B2B SaaS</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.eventTitle}>Q&A Investisseurs{"\n"}Bilan S1 2024</Text>

              <View style={styles.eventMetaRow}>
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <Feather name="calendar" size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.eventMetaText}>Demain, 14h30</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <Feather name="clock" size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.eventMetaText}>~60 min</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <Feather name="video" size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.eventMetaText}>Live</Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Countdown Timer */}
            <AnimatedCard delay={200}>
              <CountdownTimer targetDate={tomorrow} />
            </AnimatedCard>

            {/* Key Metrics Preview */}
            <AnimatedCard delay={300} style={styles.metricsSection}>
              <View style={styles.sectionTitleRow}>
                <Feather name="bar-chart-2" size={18} color={colors.textPrimary} />
                <Text style={styles.sectionTitle}>Aperçu des résultats</Text>
              </View>
              <View style={styles.metricsGrid}>
                {KEY_METRICS.map((metric, index) => (
                  <View key={index} style={styles.metricCard}>
                    <View style={styles.metricIconContainer}>
                      <Feather name={metric.icon as any} size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <View style={styles.metricTrendRow}>
                      <Feather
                        name={metric.positive ? "trending-up" : "trending-down"}
                        size={12}
                        color={metric.positive ? colors.success : colors.danger}
                      />
                      <Text style={[styles.metricTrendText, metric.positive && styles.metricTrendPositive]}>
                        {metric.trend}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </AnimatedCard>

            {/* Agenda Section */}
            <AnimatedCard delay={400} style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setShowAgenda(!showAgenda)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleRow}>
                  <Feather name="list" size={18} color={colors.textPrimary} />
                  <Text style={styles.sectionTitle}>Programme</Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: showAgenda ? "180deg" : "0deg" }] }}>
                  <Feather name="chevron-down" size={20} color={colors.textSecondary} />
                </Animated.View>
              </TouchableOpacity>

              {showAgenda && (
                <View style={styles.agendaList}>
                  {AGENDA_ITEMS.map((item, index) => (
                    <View key={item.id} style={styles.agendaItem}>
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.agendaNumber}
                      >
                        <Text style={styles.agendaNumberText}>{index + 1}</Text>
                      </LinearGradient>
                      <View style={styles.agendaContent}>
                        <Text style={styles.agendaTitle}>{item.title}</Text>
                        <Text style={styles.agendaDuration}>{item.duration}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </AnimatedCard>

            {/* Questions Section */}
            <AnimatedCard delay={500} style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setShowQuestions(!showQuestions)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleRow}>
                  <Feather name="help-circle" size={18} color={colors.textPrimary} />
                  <Text style={styles.sectionTitle}>Questions</Text>
                  <View style={styles.questionCountBadge}>
                    <Text style={styles.questionCountText}>{questions.length}</Text>
                  </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: showQuestions ? "180deg" : "0deg" }] }}>
                  <Feather name="chevron-down" size={20} color={colors.textSecondary} />
                </Animated.View>
              </TouchableOpacity>

              {showQuestions && (
                <View style={styles.questionsList}>
                  {[...questions].sort((a, b) => b.upvotes - a.upvotes).map((q, index) => (
                    <View
                      key={q.id}
                      style={[styles.questionItem, index === 0 && styles.questionItemTop]}
                    >
                      <Image source={{ uri: q.avatarUrl }} style={styles.questionAvatar} />
                      <View style={styles.questionContent}>
                        <View style={styles.questionHeader}>
                          <Text style={styles.questionAuthor}>{q.author}</Text>
                          {index === 0 && (
                            <View style={styles.topQuestionBadge}>
                              <Feather name="award" size={10} color={colors.warningDark} />
                              <Text style={styles.topQuestionText}>Top</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.questionText}>{q.text}</Text>
                        <Text style={styles.questionTime}>{q.timestamp}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.upvoteButton}
                        onPress={() => handleUpvote(q.id)}
                        activeOpacity={0.7}
                      >
                         <View style={styles.upvoteContainer}>
                            <Feather name="chevron-up" size={18} color={colors.primary} />
                            <Text style={styles.upvoteCount}>{q.upvotes}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </AnimatedCard>

            {/* Speakers Section */}
            <AnimatedCard delay={600} style={styles.speakersSection}>
              <View style={styles.sectionTitleRow}>
                <Feather name="mic" size={18} color={colors.textPrimary} />
                <Text style={styles.sectionTitle}>Intervenants</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.speakersScroll}
              >
                {[
                  { name: "Thomas Martin", role: "CEO & Co-fondateur", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
                  { name: "Sophie Durand", role: "CFO", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
                  { name: "Marc Leblanc", role: "CTO", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
                ].map((speaker, index) => (
                  <View key={index} style={styles.speakerCard}>
                    <View style={styles.speakerAvatarContainer}>
                      <Image source={{ uri: speaker.avatar }} style={styles.speakerAvatar} />
                    </View>
                    <Text style={styles.speakerName}>{speaker.name}</Text>
                    <Text style={styles.speakerRole}>{speaker.role}</Text>
                  </View>
                ))}
              </ScrollView>
            </AnimatedCard>

            {/* Bottom Spacing */}
            <View style={{ height: 140 }} />
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            {/* Question Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.questionInput}
                placeholder="Posez votre question..."
                placeholderTextColor={colors.textTertiary}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
                onPress={handleSubmitQuestion}
                disabled={!question.trim()}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={question.trim() ? [colors.primary, colors.primaryDark] : [colors.neutral200, colors.neutral300]}
                  style={styles.sendButtonGradient}
                >
                  <Feather name="send" size={18} color={question.trim() ? colors.white : colors.textTertiary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
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
                      name={isRegistered ? "check-circle" : "calendar"}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.registerButtonText}>
                      {isRegistered ? "Inscrit !" : "S'inscrire au live"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // FOND CLAIR
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
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
    // AJOUT PADDING IMPORTANT POUR REDESCENDRE LES ÉLÉMENTS
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
    backgroundColor: colors.neutral100, // Fond bouton clair
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  // Scheduled Badge
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
    gap: spacing.sm,
  },
  scheduledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  scheduledBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Interested Badge
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
    ...shadows.md, // Ombre standard
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  startupTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
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
    backgroundColor: colors.accentLight,
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
    borderColor: colors.accentLight,
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
    color: colors.accent,
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

  // Metrics Section
  metricsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricTrendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
  },
  metricTrendPositive: {
    color: colors.successDark,
  },

  // Section Card
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Agenda
  agendaList: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  agendaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral50,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  agendaNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  agendaNumberText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  agendaContent: {
    flex: 1,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  agendaDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Questions
  questionCountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  questionCountText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  questionsList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  questionItem: {
    flexDirection: "row",
    backgroundColor: colors.neutral50,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  questionItemTop: {
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningLight,
  },
  questionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  questionContent: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  questionAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  topQuestionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  topQuestionText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.warningDark,
  },
  questionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  questionTime: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  upvoteButton: {
    alignSelf: "center",
  },
  upvoteContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    minWidth: 40,
  },
  upvoteCount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },

  // Speakers
  speakersSection: {
    marginBottom: spacing.lg,
  },
  speakersScroll: {
    paddingLeft: spacing.xs,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  speakerCard: {
    width: 110,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    marginRight: spacing.md,
    ...shadows.sm,
  },
  speakerAvatarContainer: {
    position: "relative",
    marginBottom: spacing.sm,
  },
  speakerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral200,
  },
  speakerName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 2,
  },
  speakerRole: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questionInput: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 24,
    overflow: "hidden",
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.7,
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

export default Live2;