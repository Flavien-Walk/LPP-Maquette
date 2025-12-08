import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, typography } from "../styles/indexStyles";

// Activation des animations de layout sur Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES & CONFIGURATION ============

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "#2563EB",   // Bleu Roi
  Green: "#16A34A",  // Vert Impact
  Immo: "#EA580C",   // Orange Immo
  Finance: "#7C3AED", // Violet
  Default: "#6366F1"
};

const SECTOR_ICONS: Record<string, string> = {
  Tech: "cpu",
  Green: "wind",
  Immo: "home",
  Finance: "pie-chart",
  Default: "layers"
};

interface TrendingItem {
  id: string;
  name: string;
  type: string;
  subSector: string;
  change: number;
  imageUrl: string;
  description: string;
  investors: number;
  raised: string;
  route: string; 
}

type FilterType = "all" | "Tech" | "Green" | "Immo" | "Finance";

// ============ MOCK DATA (Mise à jour avec routes) ============
const MOCK_TRENDING: TrendingItem[] = [
  {
    id: "1",
    name: "GreenTech Lyon",
    type: "Green",
    subSector: "CleanTech",
    change: 24.5,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    description: "Solutions d'énergie renouvelable pour parcs industriels.",
    investors: 342,
    raised: "2.4M€",
    route: "/projet", 
  },
  {
    id: "2",
    name: "MedIA Diagnostics",
    type: "Tech",
    subSector: "HealthTech",
    change: 18.2,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
    description: "Intelligence artificielle pour le diagnostic précoce.",
    investors: 289,
    raised: "1.8M€",
    route: "/projet2", 
  },
  {
    id: "3",
    name: "ImmoVest Nantes",
    type: "Immo",
    subSector: "PropTech",
    change: 12.8,
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    description: "Plateforme de gestion locative automatisée.",
    investors: 456,
    raised: "3.2M€",
    route: "/projet3", 
  },
  {
    id: "4",
    name: "FinFlow Systems",
    type: "Finance",
    subSector: "FinTech",
    change: 15.3,
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    description: "Infrastructure de paiement B2B nouvelle génération.",
    investors: 198,
    raised: "1.1M€",
    route: "/projet4", 
  },
  {
    id: "5",
    name: "BioFood Chain",
    type: "Green",
    subSector: "FoodTech",
    change: 22.7,
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    description: "Traçabilité alimentaire complète par blockchain.",
    investors: 267,
    raised: "1.6M€",
    route: "/projet", 
  },
  {
    id: "6",
    name: "Virtual Estate",
    type: "Immo",
    subSector: "PropTech",
    change: 19.4,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    description: "Visites immobilières en réalité augmentée.",
    investors: 321,
    raised: "2.1M€",
    route: "/projet", 
  },
];

// ============ COMPONENT CARTE STARTUP ============
const TrendingCard: React.FC<{ item: TrendingItem; rank: number }> = ({ item, rank }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const isTop3 = rank <= 3;
  const rankColors = ["#D4AF37", "#A0A0A0", "#CD7F32"]; 
  const rankColor = isTop3 ? rankColors[rank - 1] : colors.neutral200;
  const themeColor = CATEGORY_COLORS[item.type] || CATEGORY_COLORS.Default;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        // CORRECTION TS: Utilisation de "as any" pour la route dynamique
        onPress={() => router.push(item.route as any)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            {/* Image & Rank */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              <View style={[styles.rankBadge, { backgroundColor: rankColor, borderColor: colors.white }]}>
                <Text style={[styles.rankText, { color: isTop3 ? colors.white : colors.textPrimary }]}>
                  #{rank}
                </Text>
              </View>
            </View>

            {/* Infos */}
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.subSectorRow}>
                      <Feather name={SECTOR_ICONS[item.type] as any} size={10} color={themeColor} />
                      <Text style={[styles.sectorLabel, { color: themeColor }]}>{item.subSector}</Text>
                  </View>
                </View>
                
                <View style={styles.changeBadge}>
                  <Feather name="trending-up" size={12} color={colors.successDark} />
                  <Text style={styles.changeText}>+{item.change}%</Text>
                </View>
              </View>

              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.separator} />

              <View style={styles.cardFooter}>
                <View style={styles.statItem}>
                  <Feather name="users" size={12} color={colors.textTertiary} />
                  <Text style={styles.statText}>{item.investors} inv.</Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="pie-chart" size={12} color={colors.textTertiary} />
                  <Text style={styles.statText}>{item.raised}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============ MAIN COMPONENT ============
const Tendances: React.FC = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: "all", label: "Tous", icon: "layers" },
    { id: "Tech", label: "Tech", icon: "cpu" },
    { id: "Green", label: "Green", icon: "wind" },
    { id: "Immo", label: "Immo", icon: "home" },
    { id: "Finance", label: "Finance", icon: "pie-chart" },
  ];

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [selectedFilter]);

  const filteredData = useMemo(() => {
    return MOCK_TRENDING.filter(item => {
        const matchesFilter = selectedFilter === "all" || item.type === selectedFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.subSector.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* 1. HEADER */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topContainer}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tendances</Text>
                <View style={{ width: 44 }} /> 
            </View>

            <View style={styles.searchBarContainer}>
                <View style={styles.searchBar}>
                    <Feather name="search" size={18} color={colors.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une startup..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textTertiary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <View style={styles.clearBtn}>
                                <Feather name="x" size={12} color={colors.white} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.filtersWrapper}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {filters.map((f) => {
                        const isActive = selectedFilter === f.id;
                        const activeColor = f.id === 'all' ? colors.neutral900 : CATEGORY_COLORS[f.id];

                        return (
                            <TouchableOpacity
                                key={f.id}
                                style={[
                                    styles.filterChip,
                                    isActive && { backgroundColor: activeColor, borderColor: activeColor }
                                ]}
                                onPress={() => setSelectedFilter(f.id)}
                            >
                                <Feather 
                                    name={f.icon as any} 
                                    size={14} 
                                    color={isActive ? colors.white : colors.textSecondary} 
                                />
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
      </SafeAreaView>

      {/* 2. CONTENU */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO WIDGET (Bleu Primary) */}
        <LinearGradient
          colors={['#2563EB', '#1D4ED8'] as const} 
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroIconBg}>
              <Feather name="activity" size={20} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>Aperçu du marché</Text>
          </View>
          
          <View style={styles.heroStatsRow}>
            <View>
              <Text style={styles.heroStatValue}>+18.7%</Text>
              <Text style={styles.heroStatLabel}>Croissance moyenne</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View>
              <Text style={styles.heroStatValue}>2,986</Text>
              <Text style={styles.heroStatLabel}>Investisseurs actifs</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Top Startups</Text>
          <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredData.length}</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {filteredData.map((item, index) => (
            <TrendingCard key={item.id} item={item} rank={index + 1} />
          ))}
        </View>

        {filteredData.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="search" size={32} color={colors.neutral400} />
            </View>
            <Text style={styles.emptyStateTitle}>Aucun résultat</Text>
            <Text style={styles.emptyStateText}>
              Essayez de modifier votre recherche ou vos filtres.
            </Text>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
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
    backgroundColor: colors.background,
    zIndex: 10,
  },
  topContainer: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
  },
  circleBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  searchBarContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
  },
  searchBar: {
    height: 44,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizeMd,
    color: colors.textPrimary,
    height: '100%',
  },
  clearBtn: {
    backgroundColor: colors.neutral400,
    borderRadius: radius.full,
    padding: 2,
  },
  filtersWrapper: {
    height: 40,
  },
  filtersContent: {
    gap: 8,
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    gap: 6,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: typography.fontSizeSm,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: radius.xl,
    padding: 20,
    marginBottom: 24,
    ...shadows.md,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconBg: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  heroStatValue: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginRight: 8,
  },
  countBadge: {
      backgroundColor: colors.neutral200,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
  },
  countText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight, 
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    marginRight: 16,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: colors.neutral100,
  },
  rankBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    ...shadows.sm,
  },
  rankText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subSectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  sectorLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successLight + '20', 
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.successDark,
    marginLeft: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  footerSpacer: {
      height: 40,
  }
});

export default Tendances;