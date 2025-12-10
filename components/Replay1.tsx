// app/replay1.tsx - Replay: Comment lever 500K€ en 48h
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, spacing } from "../styles/indexStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES ============
interface Chapter {
  id: string;
  time: string;
  title: string;
}

interface KeyTakeaway {
  id: string;
  icon: string;
  text: string;
}

// ============ MOCK DATA ============
const CHAPTERS: Chapter[] = [
  { id: "1", time: "00:00", title: "Introduction & Présentation" },
  { id: "2", time: "05:12", title: "La préparation du Roadshow" },
  { id: "3", time: "12:45", title: "Convaincre les premiers Business Angels" },
  { id: "4", time: "24:30", title: "Le momentum : créer l'urgence" },
  { id: "5", time: "38:15", title: "Closing & Questions" },
];

const TAKEAWAYS: KeyTakeaway[] = [
  { id: "1", icon: "target", text: "Cibler les bons investisseurs avant de lancer." },
  { id: "2", icon: "clock", text: "Le timing est tout : concentrer les rdv sur 2 semaines." },
  { id: "3", icon: "file-text", text: "Avoir une Data Room irréprochable jour 1." },
];

// ============ ANIMATED COMPONENTS ============
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({
  children,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
const Replay1: React.FC = () => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleBack = () => router.back();

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
            <View style={styles.headerBadge}>
               <Feather name="play-circle" size={12} color={colors.primary} />
               <Text style={styles.headerBadgeText}>REPLAY</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Feather name="share-2" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Video Player Placeholder */}
          <View style={styles.videoContainer}>
            <ImageBackground
              source={{ uri: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=450&fit=crop" }}
              style={styles.videoThumbnail}
              imageStyle={{ borderRadius: radius.xl }}
            >
              <View style={styles.videoOverlay}>
                <TouchableOpacity 
                    style={styles.playButton} 
                    activeOpacity={0.9}
                    onPress={() => setIsPlaying(!isPlaying)}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.playButtonGradient}
                    >
                        <Feather name={isPlaying ? "pause" : "play"} size={32} color={colors.white} style={{ marginLeft: isPlaying ? 0 : 4 }} />
                    </LinearGradient>
                </TouchableOpacity>
                <View style={styles.videoDurationBadge}>
                    <Text style={styles.videoDurationText}>45:22</Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Main Info */}
          <AnimatedCard delay={100} style={styles.infoSection}>
            <View style={styles.titleRow}>
                <Text style={styles.videoTitle}>Comment lever 500K€ en 48h ⚡️</Text>
            </View>
            
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Feather name="eye" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>2.3k vues</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="calendar" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>Il y a 2 jours</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="map-pin" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>Lyon</Text>
                </View>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity 
                    style={[styles.actionButton, liked && styles.actionButtonActive]} 
                    onPress={() => setLiked(!liked)}
                >
                    <Feather name="thumbs-up" size={18} color={liked ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.actionButtonText, liked && styles.actionButtonTextActive]}>
                        {liked ? "Aimé" : "J'aime"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionButton, saved && styles.actionButtonActive]}
                    onPress={() => setSaved(!saved)}
                >
                    <Feather name="bookmark" size={18} color={saved ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.actionButtonText, saved && styles.actionButtonTextActive]}>
                        {saved ? "Enregistré" : "Sauvegarder"}
                    </Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.actionButton}>
                    <Feather name="download" size={18} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Slides</Text>
                </TouchableOpacity>
            </View>
          </AnimatedCard>

          {/* Startup Profile */}
          <AnimatedCard delay={200} style={styles.startupCard}>
             <View style={styles.startupRow}>
                <Image 
                    source={{ uri: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&h=150&fit=crop" }} 
                    style={styles.startupAvatar} 
                />
                <View style={styles.startupInfo}>
                    <Text style={styles.startupName}>FinFlow Systems</Text>
                    <Text style={styles.startupRole}>Thomas Martin, CEO</Text>
                </View>
                <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>Suivre</Text>
                </TouchableOpacity>
             </View>
             <Text style={styles.descriptionText}>
                Découvrez les coulisses de notre seed round : comment nous avons préparé notre roadshow, structuré notre data room et créé le momentum nécessaire pour closer 500K€ en un temps record.
             </Text>
          </AnimatedCard>

          {/* Key Takeaways */}
          <AnimatedCard delay={300} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Feather name="zap" size={18} color={colors.warningDark} />
                <Text style={styles.sectionTitle}>Points Clés</Text>
            </View>
            <View style={styles.takeawaysList}>
                {TAKEAWAYS.map((item) => (
                    <View key={item.id} style={styles.takeawayItem}>
                        <View style={styles.takeawayIcon}>
                            <Feather name={item.icon as any} size={16} color={colors.primary} />
                        </View>
                        <Text style={styles.takeawayText}>{item.text}</Text>
                    </View>
                ))}
            </View>
          </AnimatedCard>

          {/* Chapters */}
          <AnimatedCard delay={400} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Feather name="list" size={18} color={colors.textPrimary} />
                <Text style={styles.sectionTitle}>Chapitres</Text>
            </View>
            <View style={styles.chaptersList}>
                {CHAPTERS.map((chapter, index) => (
                    <TouchableOpacity key={chapter.id} style={styles.chapterItem} activeOpacity={0.7}>
                        <View style={styles.chapterTimeContainer}>
                            <Feather name="play" size={10} color={colors.white} />
                            <Text style={styles.chapterTime}>{chapter.time}</Text>
                        </View>
                        <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </AnimatedCard>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
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

  // Header
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
    flex: 1,
    alignItems: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },

  // Video Player
  videoContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
    backgroundColor: colors.black,
  },
  videoThumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...shadows.lg,
  },
  playButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  videoDurationBadge: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  videoDurationText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },

  // Info Section
  infoSection: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    marginBottom: spacing.sm,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: colors.primary,
  },

  // Startup Card
  startupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  startupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  startupAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral200,
  },
  startupInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  startupName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  startupRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  followButton: {
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  // Key Takeaways
  takeawaysList: {
    gap: spacing.md,
  },
  takeawayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  takeawayIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  takeawayText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  // Chapters
  chaptersList: {
    gap: spacing.sm,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chapterTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.md,
    gap: 4,
  },
  chapterTime: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
  },
  chapterTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default Replay1;