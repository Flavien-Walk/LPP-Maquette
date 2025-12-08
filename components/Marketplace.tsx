import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, spacing } from "../styles/indexStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============ 1. TYPES & INTERFACES ============

type ProjectMaturity = "idea" | "mvp" | "startup" | "scaleup";
type PackType = "don" | "microinvest" | "equity" | "avantage";
type RiskLevel = "faible" | "modéré" | "élevé";
type ViewMode = "list" | "map";

interface Project {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  maturity: ProjectMaturity;
  legalStatus: string;
  location: { city: string; region: string; lat: number; lng: number };
  summary: string;
  sector: string; // Doit correspondre aux filtres SECTORS
  tags: string[];
  target: number;
  raised: number;
  minTicket: number;
  horizon: string;
  returnPotential?: string;
  packType: PackType;
  risk: RiskLevel;
  investorsCount: number;
  rating: number;
  badges: string[];
}

interface Incubator {
  id: string;
  name: string;
  city: string;
  image: string;
  distance: string;
}

// ============ 2. MOCK DATA ============

const MOCK_INCUBATORS: Incubator[] = [
  { id: "1", name: "Station F", city: "Paris", distance: "2 km", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=200&fit=crop" },
  { id: "2", name: "H7", city: "Lyon", distance: "450 km", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop" },
  { id: "3", name: "EuraTechnologies", city: "Lille", distance: "220 km", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=300&h=200&fit=crop" },
  { id: "4", name: "Darwin", city: "Bordeaux", distance: "500 km", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop" },
];

const PROJECTS: Project[] = [
  {
    id: "1",
    name: "GreenTech Lyon",
    logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1497440001374-f26997328ef5?w=600&h=400&fit=crop",
    maturity: "startup",
    legalStatus: "SAS",
    location: { city: "Lyon", region: "Auvergne-Rhône-Alpes", lat: 45.764, lng: 4.8357 },
    summary: "Plateforme qui connecte les producteurs d'énergie solaire locaux aux industries.",
    sector: "Écologie",
    tags: ["Impact local", "B2B", "Green"],
    target: 400000,
    raised: 320000,
    minTicket: 100,
    horizon: "3-5 ans",
    returnPotential: "8-12%",
    packType: "equity",
    risk: "modéré",
    investorsCount: 124,
    rating: 4.6,
    badges: ["Dossier complet", "Validé par LPP"]
  },
  {
    id: "2",
    name: "BioFood Marseille",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    maturity: "idea",
    legalStatus: "Auto-entrepreneur",
    location: { city: "Marseille", region: "PACA", lat: 43.2965, lng: 5.3698 },
    summary: "Restaurant zéro déchet en circuit court pour le centre-ville.",
    sector: "Food",
    tags: ["FoodTech", "Bio", "Jeune entrepreneur"],
    target: 50000,
    raised: 12000,
    minTicket: 50,
    horizon: "2 ans",
    packType: "don",
    risk: "élevé",
    investorsCount: 24,
    rating: 4.2,
    badges: ["Idée", "Accompagnement recherché"]
  },
  {
    id: "3",
    name: "MedIA Diag",
    logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    maturity: "scaleup",
    legalStatus: "SA",
    location: { city: "Paris", region: "Île-de-France", lat: 48.8566, lng: 2.3522 },
    summary: "IA de diagnostic médical utilisée par 50 hôpitaux en France.",
    sector: "Santé",
    tags: ["DeepTech", "IA", "Rentable"],
    target: 1000000,
    raised: 850000,
    minTicket: 1000,
    horizon: "5+ ans",
    returnPotential: "15-20%",
    packType: "equity",
    risk: "faible",
    investorsCount: 342,
    rating: 4.9,
    badges: ["PME en croissance", "Déjà rentable"]
  },
  {
    id: "4",
    name: "FinFlow Systems",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    maturity: "startup",
    legalStatus: "SAS",
    location: { city: "La Défense", region: "Île-de-France", lat: 48.8924, lng: 2.2361 },
    summary: "Solution SaaS pour la gestion de trésorerie automatisée des PME.",
    sector: "Tech / SaaS",
    tags: ["FinTech", "B2B", "SaaS"],
    target: 200000,
    raised: 45000,
    minTicket: 500,
    horizon: "4 ans",
    returnPotential: "10-15%",
    packType: "equity",
    risk: "modéré",
    investorsCount: 45,
    rating: 4.4,
    badges: ["En levée"]
  }
];

const QUICK_FILTERS = [
  { id: "all", label: "Tous" },
  { id: "young", label: "Jeunes entrepreneurs" },
  { id: "launching", label: "Startups en lancement" },
  { id: "launched", label: "Déjà lancées" },
  { id: "pme", label: "PME en croissance" },
];

const SECTORS = [
  "Tech / SaaS", "Food", "Immobilier", "Santé", "Éducation", "Culture", "Écologie"
];

// ============ 3. HELPER COMPONENTS ============

// Correction de l'erreur TypeScript précédente sur le style
const Icon = ({ name, size = 20, color = colors.textPrimary, style }: { name: string; size?: number; color?: string; style?: any }) => (
  <Feather name={name as any} size={size} color={color} style={style} />
);

const MaturityBadge = ({ maturity }: { maturity: ProjectMaturity }) => {
  let label = "";
  let color = colors.primary;
  let bg = colors.primaryLight;

  switch (maturity) {
    case "idea":
      label = "Jeune entrepreneur";
      color = colors.accent;
      bg = colors.accentLight;
      break;
    case "mvp":
      label = "En lancement";
      color = colors.warningDark;
      bg = colors.warningLight;
      break;
    case "startup":
      label = "Startup lancée";
      color = colors.primary;
      bg = colors.primaryLight;
      break;
    case "scaleup":
      label = "PME / Scale-up";
      color = colors.successDark;
      bg = colors.successLight;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: color }]}>{label}</Text>
    </View>
  );
};

// ============ 4. MAIN COMPONENT ============

export default function Marketplace() {
  const router = useRouter();
  
  // États
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [likedProjects, setLikedProjects] = useState<string[]>([]); // Pour les likes
  
  // États Filtres Avancés
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  // --- LOGIQUE DE FILTRAGE ---
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      // 1. Recherche Texte
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sector.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filtre Rapide (Maturité simulée)
      let matchQuick = true;
      if (activeQuickFilter === "young") matchQuick = p.maturity === "idea";
      if (activeQuickFilter === "launching") matchQuick = p.maturity === "mvp";
      if (activeQuickFilter === "launched") matchQuick = p.maturity === "startup";
      if (activeQuickFilter === "pme") matchQuick = p.maturity === "scaleup";

      // 3. Filtre Secteur (Avancé)
      let matchSector = true;
      if (selectedSectors.length > 0) {
        matchSector = selectedSectors.includes(p.sector) || selectedSectors.some(s => p.sector.includes(s));
      }

      return matchSearch && matchQuick && matchSector;
    });
  }, [searchQuery, activeQuickFilter, selectedSectors]);

  // Animation BottomSheet Map
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const mapRef = useRef<MapView>(null);

  React.useEffect(() => {
    if (selectedProject && viewMode === 'map') {
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true }).start();
    } else {
      Animated.timing(sheetAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }).start();
    }
  }, [selectedProject, viewMode]);

  // Actions
  const toggleLike = (id: string) => {
    Haptics.selectionAsync();
    setLikedProjects(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSectorFilter = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const resetFilters = () => {
    setSelectedSectors([]);
    setActiveQuickFilter("all");
    setSearchQuery("");
    setShowFiltersModal(false);
  };

  // --- RENDERERS ---

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {/* LOGO REMPLACÉ PAR MENU DE NAVIGATION SIMPLE OU RETOUR */}
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnHeader}>
             <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          {['Explorer', 'Startups', 'Live'].map((item, index) => (
            <TouchableOpacity key={index} style={index === 0 ? styles.menuItemActive : styles.menuItem}>
              <Text style={index === 0 ? styles.menuTextActive : styles.menuText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* CTA CRÉER PROJET */}
        <TouchableOpacity style={styles.createBtn}>
          <Icon name="plus" size={16} color={colors.white} />
          <Text style={styles.createBtnText}>Créer un projet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchBlock}>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un projet, une startup..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowFiltersModal(true)} style={styles.filterIconBtn}>
          <Icon name="sliders" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersScroll}>
        {QUICK_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.chip, activeQuickFilter === f.id && styles.chipActive]}
            onPress={() => setActiveQuickFilter(f.id)}
          >
            <Text style={[styles.chipText, activeQuickFilter === f.id && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderIncubators = () => (
    <View style={styles.incubatorSection}>
      <Text style={styles.sectionTitle}>Incubateurs près de chez vous</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.incubatorList}>
        {MOCK_INCUBATORS.map((incubator) => (
          <TouchableOpacity key={incubator.id} style={styles.incubatorCard} activeOpacity={0.8}>
            <Image source={{ uri: incubator.image }} style={styles.incubatorImage} />
            <View style={styles.incubatorOverlay} />
            <View style={styles.incubatorContent}>
              <Text style={styles.incubatorName}>{incubator.name}</Text>
              <View style={styles.incubatorRow}>
                <Icon name="map-pin" size={10} color={colors.white} />
                <Text style={styles.incubatorCity}>{incubator.city} ({incubator.distance})</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSortBar = () => (
    <View style={styles.sortBar}>
      <Text style={styles.resultsText}>{filteredProjects.length} projets trouvés</Text>
      <View style={styles.sortActions}>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortBtnText}>Trier par</Text>
          <Icon name="chevron-down" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('list')}
          >
            <Icon name="list" size={18} color={viewMode === 'list' ? colors.primary : colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('map')}
          >
            <Icon name="map" size={18} color={viewMode === 'map' ? colors.primary : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderProjectCard = ({ item }: { item: Project }) => {
    const percent = Math.round((item.raised / item.target) * 100);
    const isLiked = likedProjects.includes(item.id);

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={() => router.push("/projet1")} 
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.logo }} style={styles.cardLogo} />
          <View style={styles.cardHeaderInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <MaturityBadge maturity={item.maturity} />
            </View>
            <View style={styles.cardLocationRow}>
              <Icon name="map-pin" size={12} color={colors.textTertiary} />
              <Text style={styles.cardLocation}>{item.location.city}, {item.location.region}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
        
        <View style={styles.cardTags}>
          {item.tags.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.investBlock}>
          <View style={styles.investRow}>
            <Text style={styles.investLabel}>Objectif {(item.target / 1000).toFixed(0)}K€</Text>
            <Text style={styles.investValueRaised}>
              {(item.raised / 1000).toFixed(0)}K€ ({percent}%)
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(percent, 100)}%` }]} />
          </View>
          <View style={styles.investMetaRow}>
            <Text style={styles.investMeta}>Ticket min. <Text style={styles.bold}>{item.minTicket}€</Text></Text>
            <Text style={styles.investMeta}>Horizon <Text style={styles.bold}>{item.horizon}</Text></Text>
            {item.returnPotential && (
              <Text style={[styles.investMeta, { color: colors.successDark }]}>
                Rendement <Text style={styles.bold}>{item.returnPotential}</Text>
              </Text>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.socialBlock}>
            <Icon name="users" size={14} color={colors.textSecondary} />
            <Text style={styles.socialText}>{item.investorsCount}</Text>
            <Icon name="star" size={14} color={colors.warning} style={{ marginLeft: 8 }} />
            <Text style={styles.socialText}>{item.rating}</Text>
          </View>
          <View style={styles.badgesRow}>
            {item.badges.slice(0, 2).map((b, i) => (
              <View key={i} style={styles.miniBadge}>
                <Icon name="check-circle" size={10} color={colors.success} />
                <Text style={styles.miniBadgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Voir le projet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btnIcon, isLiked && styles.btnIconActive]} 
            onPress={(e) => {
                e.stopPropagation();
                toggleLike(item.id);
            }}
          >
            <Icon 
                name="heart" 
                size={20} 
                color={isLiked ? colors.danger : colors.primary} 
                style={isLiked ? { fill: colors.danger } : undefined} // Fill style pour remplir le coeur si la bibliothèque le supporte, sinon color suffit
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 46.603354, longitude: 1.888334,
          latitudeDelta: 10, longitudeDelta: 10
        }}
        onPress={() => setSelectedProject(null)}
      >
        {filteredProjects.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.location.lat, longitude: p.location.lng }}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedProject(p);
            }}
          >
            <View style={[styles.markerBubble, selectedProject?.id === p.id && styles.markerBubbleActive]}>
              <View style={[
                styles.markerDot, 
                { backgroundColor: p.maturity === 'idea' ? colors.accent : colors.primary }
              ]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* BOUTON RETOUR LISTE SUR LA CARTE */}
      <SafeAreaView style={styles.mapBackButtonSafeArea} pointerEvents="box-none">
        <TouchableOpacity style={styles.mapBackButton} onPress={() => setViewMode('list')}>
            <Icon name="list" size={20} color={colors.primary} />
            <Text style={styles.mapBackButtonText}>Retour liste</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Sheet (Carte) */}
      <Animated.View style={[styles.mapSheet, { transform: [{ translateY: sheetAnim }] }]}>
        {selectedProject && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Image source={{ uri: selectedProject.logo }} style={styles.sheetLogo} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{selectedProject.name}</Text>
                <Text style={styles.sheetSubtitle}>
                  {(selectedProject.raised / 1000).toFixed(0)}K€ levés • Ticket {selectedProject.minTicket}€
                </Text>
              </View>
              <TouchableOpacity style={styles.btnPrimarySmall} onPress={() => router.push("/projet1")}>
                <Text style={styles.btnPrimaryTextSmall}>Voir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );

  const renderFiltersModal = () => (
    <Modal visible={showFiltersModal} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres avancés</Text>
            <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
              <Icon name="x" size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            
            <Text style={styles.filterLabel}>Secteur</Text>
            <View style={styles.tagsContainer}>
              {SECTORS.map(s => {
                const isSelected = selectedSectors.includes(s);
                return (
                    <TouchableOpacity 
                        key={s} 
                        style={[styles.filterTag, isSelected && styles.filterTagActive]}
                        onPress={() => toggleSectorFilter(s)}
                    >
                    <Text style={[styles.filterTagText, isSelected && styles.filterTagTextActive]}>{s}</Text>
                    </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>Montant recherché</Text>
            <View style={styles.sliderMockup}>
              <View style={styles.sliderLine} />
              <View style={styles.sliderKnob} />
              <Text style={styles.sliderValue}>10k€ - 500k€</Text>
            </View>

            <Text style={styles.filterLabel}>Type de pack</Text>
            <View style={styles.tagsContainer}>
              {['Equity', 'Don', 'Micro-invest'].map(t => (
                <TouchableOpacity key={t} style={styles.filterTag}>
                  <Text style={styles.filterTagText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.btnReset} onPress={resetFilters}>
              <Text style={styles.btnResetText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnApply} onPress={() => setShowFiltersModal(false)}>
              <Text style={styles.btnApplyText}>Appliquer ({filteredProjects.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      {renderSearchBar()}
      
      {/* Contenu Principal */}
      <View style={styles.mainContent}>
        {viewMode === "list" ? (
          <>
            <ScrollView contentContainerStyle={styles.listContainer}>
              {renderIncubators()}
              {renderSortBar()}
              
              {filteredProjects.length > 0 ? (
                  filteredProjects.map(p => (
                    <View key={p.id}>
                      {renderProjectCard({ item: p })}
                    </View>
                  ))
              ) : (
                  <View style={styles.emptyState}>
                      <Icon name="search" size={40} color={colors.textTertiary} />
                      <Text style={styles.emptyText}>Aucun projet ne correspond à vos critères.</Text>
                      <TouchableOpacity onPress={resetFilters}>
                          <Text style={styles.emptyLink}>Réinitialiser les filtres</Text>
                      </TouchableOpacity>
                  </View>
              )}
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        ) : (
          renderMapView()
        )}
      </View>

      {renderFiltersModal()}
    </SafeAreaView>
  );
}

// ============ 5. STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // HEADER (MODIFIÉ)
  header: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtnHeader: {
      paddingRight: spacing.md,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  menuItem: {},
  menuItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 2,
  },
  menuText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  menuTextActive: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    gap: 4,
    ...shadows.sm,
  },
  createBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // SEARCH BLOCK
  searchBlock: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterIconBtn: {
    padding: spacing.xs,
  },
  quickFiltersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
  },

  // INCUBATORS SECTION
  incubatorSection: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  incubatorList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  incubatorCard: {
    width: 140,
    height: 100,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral200,
  },
  incubatorImage: {
    width: '100%',
    height: '100%',
  },
  incubatorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  incubatorContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  incubatorName: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  incubatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incubatorCity: {
    color: colors.neutral100,
    fontSize: 10,
  },

  // SORT BAR
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.neutral200,
    borderRadius: radius.md,
    padding: 2,
  },
  toggleBtn: {
    padding: 6,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },

  // MAIN CONTENT
  mainContent: {
    flex: 1,
  },
  listContainer: {
    // paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // PROJECT CARD
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  cardLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  cardSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.neutral100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  // INVEST BLOCK
  investBlock: {
    backgroundColor: colors.neutral50,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  investRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  investLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  investValueRaised: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.neutral200,
    borderRadius: radius.full,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  investMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // FOOTER & SOCIAL
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  socialBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    color: colors.successDark,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    ...shadows.glow,
  },
  btnPrimaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  btnIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconActive: {
      backgroundColor: colors.dangerLight,
  },

  // BADGE STYLES
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // MAP STYLES
  mapContainer: {
    flex: 1,
  },
  markerBubble: {
    backgroundColor: colors.white,
    padding: 4,
    borderRadius: radius.full,
    ...shadows.sm,
  },
  markerBubbleActive: {
    transform: [{ scale: 1.2 }],
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
  },
  mapSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.xl,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetContent: {},
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sheetLogo: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  btnPrimarySmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  btnPrimaryTextSmall: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  // Bouton Retour Map
  mapBackButtonSafeArea: {
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 100,
  },
  mapBackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: radius.full,
      ...shadows.md,
      gap: 8,
  },
  mapBackButtonText: {
      fontWeight: '600',
      color: colors.primary,
      fontSize: 14,
  },

  // MODAL FILTERS
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTagActive: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
  },
  filterTagText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTagTextActive: {
      color: colors.primary,
      fontWeight: '600',
  },
  sliderMockup: {
    height: 40,
    justifyContent: 'center',
  },
  sliderLine: {
    height: 4,
    backgroundColor: colors.neutral200,
    borderRadius: 2,
  },
  sliderKnob: {
    position: 'absolute',
    left: '30%',
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  sliderValue: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  btnReset: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  btnResetText: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  btnApply: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  btnApplyText: {
    fontWeight: '600',
    color: colors.white,
  },
  emptyState: {
      alignItems: 'center',
      marginTop: 40,
      gap: 10,
  },
  emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
  },
  emptyLink: {
      color: colors.primary,
      fontWeight: '600',
  }
});