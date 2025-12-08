// components/Profil.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, spacing } from "../styles/indexStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES ============
interface Investment {
  id: string;
  projectName: string;
  imageUrl: string;
  amount: number;
  shares: number;
  date: string;
  sector: string;
  variation: number;
}

interface Activity {
  id: string;
  type: "investment" | "comment" | "like" | "share";
  description: string;
  timestamp: string;
  projectName?: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

// ============ MOCK DATA ============
const PROFILE_DATA = {
  name: "Marie Dupont",
  username: "@marie.dupont",
  avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  coverUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop",
  bio: "Investisseuse passionnée par l'innovation et les startups à impact. Spécialisée en FoodTech et CleanTech. 🌱",
  location: "Lyon, France",
  joinDate: "Janvier 2023",
  verified: false,
  stats: {
    investments: 12,
    totalInvested: 45000,
    portfolio: 8,
    following: 34,
    followers: 128,
  },
};

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "1",
    projectName: "GreenTech Lyon",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    amount: 5000,
    shares: 50,
    date: "15 Nov 2024",
    sector: "CleanTech",
    variation: 12.5,
  },
  {
    id: "2",
    projectName: "FoodLab Marseille",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
    amount: 3000,
    shares: 30,
    date: "02 Nov 2024",
    sector: "FoodTech",
    variation: -2.1,
  },
  {
    id: "3",
    projectName: "EcoPackaging",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
    amount: 2500,
    shares: 25,
    date: "20 Oct 2024",
    sector: "CleanTech",
    variation: 8.3,
  },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "investment",
    description: "A investi 5 000€ dans",
    projectName: "GreenTech Lyon",
    timestamp: "Il y a 2 jours",
  },
  {
    id: "2",
    type: "comment",
    description: "A commenté",
    projectName: "FoodLab Marseille",
    timestamp: "Il y a 5 jours",
  },
  {
    id: "3",
    type: "like",
    description: "A aimé",
    projectName: "EcoPackaging",
    timestamp: "Il y a 1 semaine",
  },
];

const MOCK_BADGES: Badge[] = [
  {
    id: "1",
    name: "Pionnier",
    icon: "flag",
    description: "Premier investissement",
    unlocked: true,
  },
  {
    id: "2",
    name: "Collectionneur",
    icon: "grid",
    description: "10 projets au portfolio",
    unlocked: true,
  },
  {
    id: "3",
    name: "Impact",
    icon: "heart",
    description: "5 projets CleanTech",
    unlocked: true,
  },
  {
    id: "4",
    name: "Expert",
    icon: "award",
    description: "50 000€ investis",
    unlocked: false,
  },
];

// ============ UTILITY COMPONENTS ============
const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({
  name,
  size = 20,
  color = colors.textPrimary,
}) => {
  const iconMap: { [key: string]: string } = {
    "arrow-left": "arrow-left",
    "share": "share-2",
    "more": "more-horizontal",
    "location": "map-pin",
    "calendar": "calendar",
    "trending": "trending-up",
    "trending-down": "trending-down",
    "users": "users",
    "heart": "heart",
    "message": "message-circle",
    "flag": "flag",
    "grid": "grid",
    "award": "award",
    "lock": "lock",
    "check": "check",
  };

  return <Feather name={iconMap[name] || name} size={size} color={color} />;
};

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InvestmentCard: React.FC<{ investment: Investment }> = ({ investment }) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.investmentCard}
      activeOpacity={0.8}
      onPress={() => {
        // Navigation vers le projet
        if (investment.projectName === "GreenTech Lyon") {
          router.push("/projet1");
        }
      }}
    >
      <Image source={{ uri: investment.imageUrl }} style={styles.investmentImage} />
      <View style={styles.investmentContent}>
        <View style={styles.investmentHeader}>
          <Text style={styles.investmentName}>{investment.projectName}</Text>
          <View style={[
            styles.variationBadge,
            investment.variation >= 0 ? styles.variationPositive : styles.variationNegative
          ]}>
            <Icon 
              name={investment.variation >= 0 ? "trending" : "trending-down"} 
              size={12} 
              color={investment.variation >= 0 ? colors.success : colors.danger} 
            />
            <Text style={[
              styles.variationText,
              investment.variation >= 0 ? styles.variationTextPositive : styles.variationTextNegative
            ]}>
              {investment.variation >= 0 ? "+" : ""}{investment.variation}%
            </Text>
          </View>
        </View>
        <Text style={styles.investmentSector}>{investment.sector}</Text>
        <View style={styles.investmentDetails}>
          <View style={styles.investmentDetailRow}>
            <Text style={styles.investmentDetailLabel}>Montant investi</Text>
            <Text style={styles.investmentDetailValue}>{investment.amount.toLocaleString("fr-FR")} €</Text>
          </View>
          <View style={styles.investmentDetailRow}>
            <Text style={styles.investmentDetailLabel}>Parts détenues</Text>
            <Text style={styles.investmentDetailValue}>{investment.shares} parts</Text>
          </View>
          <View style={styles.investmentDetailRow}>
            <Text style={styles.investmentDetailLabel}>Date</Text>
            <Text style={styles.investmentDetailValue}>{investment.date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case "investment": return "trending";
      case "comment": return "message";
      case "like": return "heart";
      case "share": return "share";
      default: return "check";
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case "investment": return colors.primary;
      case "comment": return colors.accent;
      case "like": return colors.danger;
      case "share": return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: getColor() + "20" }]}>
        <Icon name={getIcon()} size={16} color={getColor()} />
      </View>
      <View style={styles.activityItemContent}>
        <Text style={styles.activityText}>
          {activity.description} <Text style={styles.activityProject}>{activity.projectName}</Text>
        </Text>
        <Text style={styles.activityTime}>{activity.timestamp}</Text>
      </View>
    </View>
  );
};

const BadgeItem: React.FC<{ badge: Badge }> = ({ badge }) => (
  <View style={[styles.badgeItem, !badge.unlocked && styles.badgeItemLocked]}>
    <View style={[styles.badgeIconContainer, !badge.unlocked && styles.badgeIconLocked]}>
      {badge.unlocked ? (
        <Icon name={badge.icon} size={24} color={colors.primary} />
      ) : (
        <Icon name="lock" size={24} color={colors.textTertiary} />
      )}
    </View>
    <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]}>
      {badge.name}
    </Text>
    <Text style={styles.badgeDescription}>{badge.description}</Text>
  </View>
);

// ============ MAIN COMPONENT ============
const Profil: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"portfolio" | "activity" | "badges">("portfolio");
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const coverTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fixe */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{PROFILE_DATA.name}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="share" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Cover Image */}
        <Animated.View style={[styles.coverContainer, { transform: [{ translateY: coverTranslateY }] }]}>
          <Image source={{ uri: PROFILE_DATA.coverUrl }} style={styles.coverImage} />
          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.8)"]}
            style={styles.coverGradient}
          />
          <View style={styles.coverActions}>
            <TouchableOpacity onPress={() => router.back()} style={styles.coverButton}>
              <Icon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.coverButton}>
              <Icon name="share" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: PROFILE_DATA.avatarUrl }} style={styles.avatar} />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{PROFILE_DATA.name}</Text>
              {PROFILE_DATA.verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check" size={14} color={colors.white} />
                </View>
              )}
            </View>
            <Text style={styles.username}>{PROFILE_DATA.username}</Text>
            <Text style={styles.bio}>{PROFILE_DATA.bio}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Icon name="location" size={16} color={colors.textTertiary} />
                <Text style={styles.metaText}>{PROFILE_DATA.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="calendar" size={16} color={colors.textTertiary} />
                <Text style={styles.metaText}>Membre depuis {PROFILE_DATA.joinDate}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatBox label="Investissements" value={PROFILE_DATA.stats.investments} />
            <StatBox label="Portfolio" value={PROFILE_DATA.stats.portfolio} />
            <StatBox label="Abonnés" value={PROFILE_DATA.stats.followers} />
            <StatBox label="Abonnements" value={PROFILE_DATA.stats.following} />
          </View>

          {/* Total investi */}
          <View style={styles.totalInvestedCard}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.totalInvestedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.totalInvestedLabel}>Total investi</Text>
              <Text style={styles.totalInvestedValue}>
                {PROFILE_DATA.stats.totalInvested.toLocaleString("fr-FR")} €
              </Text>
              <Text style={styles.totalInvestedSubtext}>Réparti sur {PROFILE_DATA.stats.portfolio} projets</Text>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Suivre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Icon name="message" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "portfolio" && styles.tabActive]}
            onPress={() => setActiveTab("portfolio")}
          >
            <Text style={[styles.tabText, activeTab === "portfolio" && styles.tabTextActive]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "activity" && styles.tabActive]}
            onPress={() => setActiveTab("activity")}
          >
            <Text style={[styles.tabText, activeTab === "activity" && styles.tabTextActive]}>
              Activité
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "badges" && styles.tabActive]}
            onPress={() => setActiveTab("badges")}
          >
            <Text style={[styles.tabText, activeTab === "badges" && styles.tabTextActive]}>
              Badges
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "portfolio" && (
            <View style={styles.portfolioContent}>
              <Text style={styles.sectionTitle}>Mes investissements</Text>
              {MOCK_INVESTMENTS.map((investment) => (
                <InvestmentCard key={investment.id} investment={investment} />
              ))}
            </View>
          )}

          {activeTab === "activity" && (
            <View style={styles.activityContent}>
              <Text style={styles.sectionTitle}>Activité récente</Text>
              {MOCK_ACTIVITIES.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          )}

          {activeTab === "badges" && (
            <View style={styles.badgesContent}>
              <Text style={styles.sectionTitle}>Badges ({MOCK_BADGES.filter(b => b.unlocked).length}/{MOCK_BADGES.length})</Text>
              <View style={styles.badgesGrid}>
                {MOCK_BADGES.map((badge) => (
                  <BadgeItem key={badge.id} badge={badge} />
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    height: 200,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  coverActions: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  coverButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    marginTop: -50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  avatarContainer: {
    marginTop: -60,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bio: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 22,
  },
  metaInfo: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  totalInvestedCard: {
    marginTop: spacing.lg,
    borderRadius: 16,
    overflow: "hidden",
  },
  totalInvestedGradient: {
    padding: spacing.xl,
    alignItems: "center",
  },
  totalInvestedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  totalInvestedValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.white,
    marginTop: 8,
  },
  totalInvestedSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    backgroundColor: colors.background,
    minHeight: 400,
  },
  portfolioContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  investmentCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  investmentImage: {
    width: "100%",
    height: 180,
  },
  investmentContent: {
    padding: spacing.md,
  },
  investmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  investmentName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  variationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  variationPositive: {
    backgroundColor: colors.successLight,
  },
  variationNegative: {
    backgroundColor: colors.dangerLight,
  },
  variationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  variationTextPositive: {
    color: colors.success,
  },
  variationTextNegative: {
    color: colors.danger,
  },
  investmentSector: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  investmentDetails: {
    gap: 8,
  },
  investmentDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  investmentDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  investmentDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  activityContent: {
    padding: spacing.lg,
  },
  activityItem: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityItemContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  activityProject: {
    fontWeight: "600",
    color: colors.primary,
  },
  activityTime: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  badgesContent: {
    padding: spacing.lg,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  badgeItem: {
    width: (SCREEN_WIDTH - spacing.lg * 3) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  badgeIconLocked: {
    backgroundColor: colors.neutral100,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: colors.textTertiary,
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default Profil;