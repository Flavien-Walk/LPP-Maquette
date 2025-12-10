// app/replay2.tsx - Masterclass Valorisation - LPP Academy x Incubateur
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ImageBackground,
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
interface Chapter {
  id: string;
  time: string;
  title: string;
}

interface Resource {
  id: string;
  type: "excel" | "pdf";
  title: string;
  size: string;
}

// ============ MOCK DATA ============
const CHAPTERS: Chapter[] = [
  { id: "1", time: "00:00", title: "Introduction : Les enjeux de la valo" },
  { id: "2", time: "15:30", title: "Méthode des comparables (Multiples)" },
  { id: "3", time: "35:45", title: "Méthode DCF (Discounted Cash Flow)" },
  { id: "4", time: "55:10", title: "Méthode du Capital-Risque (VC Method)" },
  { id: "5", time: "1:10:00", title: "Négocier sa valorisation" },
];

const RESOURCES: Resource[] = [
  { id: "1", type: "excel", title: "Template Valorisation DCF.xlsx", size: "2.4 MB" },
  { id: "2", type: "pdf", title: "Slides Masterclass.pdf", size: "12 MB" },
  { id: "3", type: "excel", title: "Calculateur Table de Capitalisation.xlsx", size: "1.8 MB" },
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
const Replay2: React.FC = () => {
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
               <Feather name="award" size={12} color={colors.accent} />
               <Text style={styles.headerBadgeText}>MASTERCLASS</Text>
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
              source={{ uri: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop" }}
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
                        colors={[colors.accent, colors.accentDark]}
                        style={styles.playButtonGradient}
                    >
                        <Feather name={isPlaying ? "pause" : "play"} size={32} color={colors.white} style={{ marginLeft: isPlaying ? 0 : 4 }} />
                    </LinearGradient>
                </TouchableOpacity>
                <View style={styles.videoDurationBadge}>
                    <Text style={styles.videoDurationText}>1:20:15</Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Main Info */}
          <AnimatedCard delay={100} style={styles.infoSection}>
            <View style={styles.titleRow}>
                <Text style={styles.videoTitle}>Masterclass : Valoriser sa Startup </Text>
            </View>
            
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Feather name="eye" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>5.6k vues</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="calendar" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>Il y a 1 semaine</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="map-pin" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>Station F</Text>
                </View>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity 
                    style={[styles.actionButton, liked && styles.actionButtonActive]} 
                    onPress={() => setLiked(!liked)}
                >
                    <Feather name="thumbs-up" size={18} color={liked ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.actionButtonText, liked && styles.actionButtonTextActive]}>
                        {liked ? "Aimé" : "J'aime"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionButton, saved && styles.actionButtonActive]}
                    onPress={() => setSaved(!saved)}
                >
                    <Feather name="bookmark" size={18} color={saved ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.actionButtonText, saved && styles.actionButtonTextActive]}>
                        {saved ? "Enregistré" : "Sauvegarder"}
                    </Text>
                </TouchableOpacity>
            </View>
          </AnimatedCard>

         {/* Host / Incubator Profile */}
          <AnimatedCard delay={200} style={styles.startupCard}>
             <View style={styles.startupRow}>
                {/* Conteneur Logo avec le Badge en absolu */}
                <View style={styles.incubatorLogoContainer}>
                    <Text style={styles.incubatorLogoText}>H</Text>
                    <View style={styles.verifiedBadge}>
                        <Feather name="check" size={10} color={colors.white} />
                    </View>
                </View>

                <View style={styles.startupInfo}>
                    <Text style={styles.startupName}>Incubateur HEC</Text>
                    
                </View>

                <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>S'abonner</Text>
                </TouchableOpacity>
             </View>
             <Text style={styles.descriptionText}>
                Une session exclusive animée par les experts de l'Incubateur HEC pour maîtriser les méthodes de valorisation (DCF, Comparables) et préparer vos négociations avec les VCs.
             </Text>
          </AnimatedCard>

          {/* Resources (Spécifique Masterclass) */}
          <AnimatedCard delay={300} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Feather name="download-cloud" size={18} color={colors.accent} />
                <Text style={styles.sectionTitle}>Ressources à télécharger</Text>
            </View>
            <View style={styles.resourcesList}>
                {RESOURCES.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.resourceItem} activeOpacity={0.7}>
                        <View style={[styles.resourceIcon, item.type === 'excel' ? styles.excelIcon : styles.pdfIcon]}>
                            <Feather name={item.type === 'excel' ? "grid" : "file-text"} size={18} color={colors.white} />
                        </View>
                        <View style={styles.resourceInfo}>
                            <Text style={styles.resourceTitle}>{item.title}</Text>
                            <Text style={styles.resourceSize}>{item.size}</Text>
                        </View>
                        <Feather name="download" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
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
                {CHAPTERS.map((chapter) => (
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
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
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
    backgroundColor: "rgba(0,0,0,0.3)",
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
    justifyContent: "flex-start",
    gap: spacing.md,
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
    backgroundColor: colors.accentLight,
    borderColor: colors.accentLight,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: colors.accent,
  },

  // Host Card
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
  incubatorLogoContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: colors.neutral900, // Logo sombre
      alignItems: 'center',
      justifyContent: 'center',
  },
  incubatorLogoText: {
      color: colors.white,
      fontWeight: '900',
      fontSize: 20,
  },
  startupInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  startupName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Resources List
  resourcesList: {
      gap: spacing.md,
  },
  resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral50,
      padding: spacing.sm,
      borderRadius: radius.lg,
  },
  resourceIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
  },
  excelIcon: {
      backgroundColor: "#10B981", // Green
  },
  pdfIcon: {
      backgroundColor: "#EF4444", // Red
  },
  resourceInfo: {
      flex: 1,
  },
  resourceTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
  },
  resourceSize: {
      fontSize: 12,
      color: colors.textTertiary,
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

export default Replay2;