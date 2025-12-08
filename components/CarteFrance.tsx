import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, typography } from "../styles/indexStyles";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============ CONFIGURATION & COULEURS ============
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// 🎨 PALETTE DE COULEURS STRICTE POUR LA COHÉRENCE
const CATEGORY_COLORS: Record<string, string> = {
    Tech: "#2563EB",   // Bleu Roi (Tech)
    Green: "#16A34A",  // Vert (Impact/Green)
    Immo: "#EA580C",   // Orange (Immobilier)
    Default: "#6366F1" // Indigo (Autre)
};

// Style de carte très épuré pour faire "popper" les couleurs
const CUSTOM_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
];

// ============ DONNÉES ============
const FILTERS = [
  { id: "all", label: "Tous", icon: "layers" },
  { id: "Tech", label: "Tech", icon: "cpu" },
  { id: "Green", label: "Impact", icon: "wind" },
  { id: "Immo", label: "Immo", icon: "home" },
];

const PROJECTS = [
  { id: "1", city: "Paris", lat: 48.8566, lon: 2.3522, name: "Station F Startups", roi: 12, type: "Tech", amount: "1.2M€", valuation: "12M€", image: "https://images.unsplash.com/photo-1550505393-2c3b24f2666d?w=400&fit=crop" },
  { id: "2", city: "Lyon", lat: 45.7640, lon: 4.8357, name: "FoodLab Bio", roi: 10.5, type: "Green", amount: "850K€", valuation: "4.5M€", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&fit=crop" },
  { id: "3", city: "Bordeaux", lat: 44.8378, lon: -0.5792, name: "Wine Tech SaaS", roi: 9.8, type: "Tech", amount: "600K€", valuation: "3M€", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&fit=crop" },
  { id: "4", city: "Marseille", lat: 43.2965, lon: 5.3698, name: "Sunny Energy Park", roi: 14.2, type: "Green", amount: "2.1M€", valuation: "18M€", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&fit=crop" },
  { id: "5", city: "Nantes", lat: 47.2184, lon: -1.5536, name: "Résidence Loire", roi: 8.0, type: "Immo", amount: "1.5M€", valuation: "2.2M€", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&fit=crop" },
  { id: "6", city: "Lille", lat: 50.6292, lon: 3.0573, name: "MedTech Nord", roi: 13.5, type: "Tech", amount: "3.2M€", valuation: "15M€", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&fit=crop" },
  { id: "7", city: "Toulouse", lat: 43.6047, lon: 1.4442, name: "AeroSpace Parts", roi: 11.0, type: "Tech", amount: "950K€", valuation: "6M€", image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&fit=crop" },
];

// Helper pour récupérer la couleur exacte
const getCategoryColor = (type: string) => {
    return CATEGORY_COLORS[type] || CATEGORY_COLORS.Default;
};

// ============ COMPOSANT MARKER (BADGE FLOTTANT) ============
// Forme compacte, coins arrondis, bordure blanche pour contraste
const CustomMarker = ({ project, isSelected, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const color = getCategoryColor(project.type);
  // Si sélectionné, on le rend noir pour marquer le coup, sinon couleur de catégorie
  const backgroundColor = isSelected ? colors.neutral900 : color;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.2 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 200);
    return () => clearTimeout(timer);
  }, [isSelected]);

  // Initial load hack for Maps
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: project.lat, longitude: project.lon }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      style={{ zIndex: isSelected ? 999 : 1 }}
      anchor={{ x: 0.5, y: 0.5 }} // Centre le marker
    >
      <Animated.View style={[styles.markerContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.markerBadge, { backgroundColor }]}>
            <Text style={styles.markerText}>{project.roi}%</Text>
        </View>
      </Animated.View>
    </Marker>
  );
};

// ============ MAIN COMPONENT ============
const CarteFrance = () => {
  const router = useRouter();
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; 
  const mapRef = useRef<MapView>(null);

  const visibleProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      const matchesType = activeFilter === "all" || p.type === activeFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (selectedProject) {
      Animated.spring(sheetAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();

      // Petit recentrage pour bien voir le projet
      const newRegion = {
        latitude: selectedProject.lat - 1.5, 
        longitude: selectedProject.lon,
        latitudeDelta: 4,
        longitudeDelta: 4 * ASPECT_RATIO,
      };
      mapRef.current?.animateToRegion(newRegion, 600);
      
    } else {
      Animated.timing(sheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
      Keyboard.dismiss();
    }
  }, [selectedProject]);

  const handleSelectProject = (project: any) => {
    Haptics.selectionAsync();
    setSelectedProject(project);
  };

  const handleRecenter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion({
      latitude: 46.603354,
      longitude: 1.888334,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }, 800);
    setSelectedProject(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. MAPVIEW */}
      <View style={styles.mapWrapper}>
        <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            style={styles.map}
            customMapStyle={CUSTOM_MAP_STYLE}
            onMapReady={() => setIsMapReady(true)}
            initialRegion={{
                latitude: 46.603354,
                longitude: 1.888334,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            }}
            onPress={() => {
                if(selectedProject) setSelectedProject(null);
                Keyboard.dismiss();
            }}
            rotateEnabled={false}
        >
            {visibleProjects.map((project) => (
            <CustomMarker
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onPress={(e: any) => {
                    e.stopPropagation();
                    handleSelectProject(project);
                }}
            />
            ))}
        </MapView>
        
        {!isMapReady && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )}
      </View>
      
      {/* 2. UI SUPERPOSÉE */}
      <SafeAreaView style={styles.overlayUI} pointerEvents="box-none">
        
        {/* Header */}
        <View style={styles.topContainer}>
          <View style={styles.searchBarRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
              <Feather name="arrow-left" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.searchBar}>
                <Feather name="search" size={18} color={colors.textTertiary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Ville, projet..."
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

          {/* Filtres avec Couleurs Dynamiques */}
          <View style={styles.filtersContainer}>
            <Animated.ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContent}
            >
                {FILTERS.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    // Détermine la couleur active (Noire pour 'Tous', Specifique pour autres)
                    let activeColor = colors.neutral900;
                    if (filter.id !== 'all') {
                        activeColor = getCategoryColor(filter.id);
                    }

                    return (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterChip, 
                            isActive && { backgroundColor: activeColor, borderColor: activeColor }
                        ]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setActiveFilter(filter.id);
                            setSelectedProject(null);
                        }}
                    >
                        <Feather 
                            name={filter.icon as any} 
                            size={14} 
                            color={isActive ? colors.white : colors.textSecondary} 
                        />
                        <Text style={[
                            styles.filterText, 
                            isActive && styles.filterTextActive
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                    );
                })}
            </Animated.ScrollView>
          </View>
        </View>

        {/* Bouton Recentrer */}
        {!selectedProject && (
            <View style={styles.bottomControls}>
                 <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
                    <Feather name="navigation" size={20} color={colors.primary} />
                    <Text style={styles.recenterText}>Vue d'ensemble</Text>
                 </TouchableOpacity>
                 <View style={styles.pillCount}>
                    <Text style={styles.pillText}>{visibleProjects.length} projets</Text>
                 </View>
            </View>
        )}
      </SafeAreaView>

      {/* 3. BOTTOM SHEET */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: sheetAnim }] }
        ]}
      >
        {selectedProject && (
            <TouchableWithoutFeedback>
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHandleContainer}>
                          <View style={styles.sheetHandle} />
                    </View>
                    
                    <View style={styles.projectHeader}>
                        <Image source={{ uri: selectedProject.image }} style={styles.projectImage} />
                        <View style={styles.projectTitleContainer}>
                            <View style={styles.projectTopRow}>
                                <Text style={styles.projectTitle} numberOfLines={1}>{selectedProject.name}</Text>
                                {/* Badge de type coloré */}
                                <View style={[styles.miniBadge, { backgroundColor: getCategoryColor(selectedProject.type) + '20' }]}>
                                    <Text style={[styles.miniBadgeText, { color: getCategoryColor(selectedProject.type) }]}>
                                        {selectedProject.type}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.projectCityRow}>
                                <Feather name="map-pin" size={14} color={colors.textTertiary} />
                                <Text style={styles.projectCity}>{selectedProject.city}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Rendement</Text>
                            <Text style={[styles.statValue, { color: colors.successDark }]}>{selectedProject.roi}%</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Valo.</Text>
                            <Text style={styles.statValue}>{selectedProject.valuation}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Ticket</Text>
                            <Text style={styles.statValue}>100 €</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.mainActionBtn, { backgroundColor: colors.primary }]} // Action principale toujours bleu
                        activeOpacity={0.9}
                    >
                        <Text style={styles.mainActionText}>Voir l'analyse complète</Text>
                        <View style={styles.whiteIconCircle}>
                            <Feather name="arrow-right" size={16} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )}
      </Animated.View>
    </View>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  overlayUI: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingBottom: 20,
    pointerEvents: 'box-none',
  },
  topContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
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
  searchBar: {
    flex: 1,
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
  filtersContainer: {
    height: 40,
  },
  filtersScrollContent: {
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
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
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  recenterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: radius.full,
      gap: 8,
      ...shadows.md,
  },
  recenterText: {
      fontSize: typography.fontSizeSm,
      fontWeight: '600',
      color: colors.primary,
  },
  pillCount: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: radius.full,
  },
  pillText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '600',
  },
  
  // === NOUVEAU STYLE MARKER (Badge Flottant) ===
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Permet d'éviter que les markers se chevauchent trop visuellement
  },
  markerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14, // Arrondi mais pas ovale complet, style "iOS"
    borderWidth: 2,   // Bordure blanche épaisse pour détacher du fond de carte
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    minWidth: 46, // Largeur min pour uniformiser
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
      color: colors.white,
      fontWeight: '700', // Très gras pour lisibilité petite taille
      fontSize: 13,
  },

  // === BOTTOM SHEET & UI ===
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...shadows.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    zIndex: 10,
  },
  sheetContent: {
    padding: 24,
    paddingTop: 12,
  },
  sheetHandleContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
      paddingVertical: 10,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: colors.neutral200,
    borderRadius: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  projectImage: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    marginRight: 16,
    backgroundColor: colors.neutral100,
  },
  projectTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  projectTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  miniBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
  },
  miniBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  projectCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectCity: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral50,
    borderRadius: radius.xl,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    ...shadows.glow,
  },
  mainActionText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  whiteIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
  },
});

export default CarteFrance;