import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import Feather from "react-native-vector-icons/Feather";
import { shadows } from "../styles/indexStyles";

// --- CONFIGURATION ---
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const HEADER_HEIGHT = 420;

// 🔵 THÈME HEALTH TECH
const THEME_COLOR = "#0284C7"; // Sky 600
const ACCENT_COLOR = "#38BDF8"; // Sky 400
const BG_COLOR = "#F0F9FF"; // Fond bleu très pâle

// --- DATA MODEL (MedIA Diag) ---
const PROJECT_DATA = {
  id: "media-diag-01",
  name: "MedIA Diag",
  tagline: "L'IA qui détecte les tumeurs 6 mois plus tôt.",
  sector: "HealthTech / AI",
  location: "Montpellier, MedVallée",
  status: "Derniers Jours",
  raised: 4200000,
  target: 4500000,
  investors: 850,
  daysLeft: 5,
  valuationPre: "22M€",
  
  story_hook: "Chaque année, 12% des cancers sont diagnostiqués trop tard.",
  story_text: "Les radiologues sont submergés. La fatigue visuelle entraîne des erreurs évitables. MedIA Diag agit comme un 'second avis' instantané : notre algorithme Neural-X analyse les IRM en 0.4 seconde.",
  
  financials: {
    revenue: [
       { year: '2023', value: 0.2 }, { year: '2024', value: 1.5 },
       { year: '2025', value: 8.0 }, { year: '2026', value: 24.0 }
    ],
    allocation: [
        { label: "R&D & Clinique", percent: 50, color: "#3B82F6" },
        { label: "Certification", percent: 20, color: "#8B5CF6" },
        { label: "Commercial", percent: 20, color: "#06B6D4" },
        { label: "Legal", percent: 10, color: "#64748B" },
    ],
    kpi: [
        { label: "Précision IA", value: "99.8%" },
        { label: "Hôpitaux", value: "45" },
        { label: "Vitesse", value: "0.4s" },
        { label: "Brevet", value: "Validé" },
    ]
  },
  team: [
    { name: "Dr. Alix Raynal", role: "CEO", bio: "Radiologue, ex-CHU.", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Karim Benzer", role: "CTO", bio: "Ex-Google DeepMind.", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sarah Cohen", role: "CMO", bio: "Oncologue.", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  ],
  documents: [
    { title: "Résultats Cliniques Phase II", type: "PDF", size: "8.4 Mo", locked: false },
    { title: "Dossier Certification FDA", type: "PDF", size: "15 Mo", locked: true },
  ],
  timeline: [
      { date: "2020", title: "Entraînement Algorithme", active: true },
      { date: "2022", title: "Certification CE Medical", active: true },
      { date: "2024", title: "Déploiement Europe", active: true },
      { date: "2026", title: "Agrément FDA (USA)", active: false },
  ]
};

// --- COMPOSANTS UI ---
const ChartBar = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Croissance ARR (M€)</Text>
            <View style={styles.barChartRow}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <View style={[styles.barFill, { height: Math.max(10, (item.value / maxVal) * 100), backgroundColor: index > 2 ? ACCENT_COLOR : THEME_COLOR }]} />
                        <Text style={styles.barLabel}>{item.year}</Text>
                        <Text style={styles.barValue}>{item.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const SectionHeader = ({ title, icon }: { title: string, icon?: string }) => (
    <View style={styles.sectionHeader}>
        {icon && <Feather name={icon as any} size={18} color={THEME_COLOR} style={{marginRight:8}} />}
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

// --- MAIN SCREEN ---
const Projet2: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"vision" | "tech" | "docs">("vision");
  const [investMode, setInvestMode] = useState<"equity" | "tax" | "impact">("equity");
  const [investAmount, setInvestAmount] = useState(2000);
  const [isLiked, setIsLiked] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;
  
  // Animation Header
  const headerTranslateY = scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT / 2.5], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

  // --- RENDU CONTENU ---
  const renderVisionTab = () => (
      <View style={styles.tabContent}>
          <View style={styles.card}>
              <Text style={styles.hookText}>"{PROJECT_DATA.story_hook}"</Text>
              <Text style={styles.bodyText}>{PROJECT_DATA.story_text}</Text>
              <View style={styles.timelineContainer}>
                  {PROJECT_DATA.timeline.map((item, i) => (
                      <View key={i} style={styles.timelineItem}>
                          <View style={[styles.timelineDot, item.active ? {backgroundColor: THEME_COLOR} : {backgroundColor: '#E2E8F0'}]} />
                          <View style={styles.timelineContent}>
                              <Text style={styles.timelineYear}>{item.date}</Text>
                              <Text style={styles.timelineTitle}>{item.title}</Text>
                          </View>
                      </View>
                  ))}
              </View>
          </View>
           <View style={styles.mapCard}>
              <SectionHeader title="Campus MedVallée" icon="map-pin" />
              <View style={styles.mapWrap}>
                <MapView 
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={{ latitude: 43.63, longitude: 3.86, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
                    scrollEnabled={false} zoomEnabled={false}
                >
                    <Marker coordinate={{ latitude: 43.63, longitude: 3.86 }} pinColor={THEME_COLOR} />
                </MapView>
              </View>
              <Text style={styles.addressText}>{PROJECT_DATA.location}</Text>
          </View>
      </View>
  );

  const renderTechTab = () => (
      <View style={styles.tabContent}>
          <View style={styles.kpiGrid}>
              {PROJECT_DATA.financials.kpi.map((k, i) => (
                  <View key={i} style={styles.kpiBox}>
                      <Text style={styles.kpiValue}>{k.value}</Text>
                      <Text style={styles.kpiLabel}>{k.label}</Text>
                  </View>
              ))}
          </View>
          <ChartBar data={PROJECT_DATA.financials.revenue} />
          
           <View style={styles.simBox}>
              <SectionHeader title="Simulateur" icon="activity" />
              <View style={styles.modeSelector}>
                  {[{id: 'equity', label: 'Action'}, {id: 'tax', label: 'Défisc.'}, {id: 'impact', label: 'Impact'}].map((m) => (
                      <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)} 
                        style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                          <Text style={[styles.modeLabel, investMode === m.id && {color:'white'}]}>{m.label}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
              <View style={styles.sliderRow}>
                  <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(200, p-200))} style={styles.plusMinus}><Feather name="minus" size={20} color={THEME_COLOR}/></TouchableOpacity>
                  <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                  <TouchableOpacity onPress={() => setInvestAmount(p => p+200)} style={styles.plusMinus}><Feather name="plus" size={20} color={THEME_COLOR}/></TouchableOpacity>
              </View>
           </View>
      </View>
  );

  const renderDocsTab = () => (
      <View style={styles.tabContent}>
          <SectionHeader title="Équipe & Docs" icon="users" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
              {PROJECT_DATA.team.map((m, i) => (
                  <View key={i} style={styles.teamCard}>
                      <Image source={{ uri: m.img }} style={styles.teamAvatar} />
                      <Text style={styles.teamName}>{m.name}</Text>
                      <Text style={styles.teamRole}>{m.role}</Text>
                  </View>
              ))}
          </ScrollView>
          <View style={styles.docList}>
              {PROJECT_DATA.documents.map((doc, i) => (
                  <TouchableOpacity key={i} style={styles.docRow}>
                      <View style={styles.docIcon}><Feather name="file-text" size={20} color={THEME_COLOR} /></View>
                      <View style={{flex:1}}>
                          <Text style={styles.docTitle}>{doc.title}</Text>
                          <Text style={styles.docMeta}>{doc.type}</Text>
                      </View>
                      <Feather name="download" size={18} color={THEME_COLOR} />
                  </TouchableOpacity>
              ))}
          </View>
      </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* 1. HEADER AVEC IMAGE DE FOND (z-index bas) */}
      <View style={styles.headerAbsolute}>
         <Animated.Image 
            source={{ uri: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80" }}
            style={[styles.headerImage, { transform: [{translateY: headerTranslateY}] }]} 
         />
         <LinearGradient colors={['rgba(2, 132, 199, 0.4)', 'rgba(15, 23, 42, 0.9)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.5, 1]} />
         
         {/* Contenu textuel du header (Titre, Badges...) */}
         <Animated.View style={[styles.heroContent, { opacity: headerOpacity }]}>
             <View style={styles.badgeRow}>
                 <View style={styles.statusBadge}><Text style={styles.statusText}>{PROJECT_DATA.status}</Text></View>
                 <View style={styles.sectorBadge}><Text style={styles.sectorText}>{PROJECT_DATA.sector}</Text></View>
             </View>
             <Text style={styles.projectTitle}>{PROJECT_DATA.name}</Text>
             <Text style={styles.projectLoc}><Feather name="map-pin" size={14}/> {PROJECT_DATA.location}</Text>
             
             <View style={styles.progressCard}>
                 <View style={styles.progressStats}>
                     <Text style={styles.raisedTxt}>{(PROJECT_DATA.raised/1000000).toFixed(1)}M€</Text>
                     <Text style={styles.percentTxt}>{percentRaised.toFixed(0)}%</Text>
                 </View>
                 <View style={styles.track}><View style={[styles.fill, {width:`${percentRaised}%`}]} /></View>
                 <Text style={styles.metaTxt}>{PROJECT_DATA.investors} Investisseurs • J-{PROJECT_DATA.daysLeft}</Text>
             </View>
         </Animated.View>
      </View>

      {/* 2. NAVIGATION BAR (z-index HAUT) 
         Placée ici pour être au-dessus de l'image et du scrollview visuellement */}
      <SafeAreaView style={styles.navBar} pointerEvents="box-none">
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.circleBtn}
            activeOpacity={0.7}
          >
             <Feather name="arrow-left" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.navRight}>
             <TouchableOpacity 
                onPress={() => { 
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                    setIsLiked(!isLiked); 
                }} 
                style={styles.circleBtn}
                activeOpacity={0.7}
             >
                 <Feather 
                    name="heart" 
                    size={22} 
                    color={isLiked ? "#EF4444" : "#0F172A"} 
                 />
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.circleBtn}>
                <Feather name="share-2" size={22} color="#0F172A" />
             </TouchableOpacity>
          </View>
      </SafeAreaView>

      {/* 3. SCROLLVIEW (Contenu principal) */}
      <Animated.ScrollView 
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 30, paddingBottom: 120 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
          {/* TABS */}
          <View style={styles.tabsContainer}>
              {[{ id: 'vision', label: 'Vision' }, { id: 'tech', label: 'Tech & Data' }, { id: 'docs', label: 'Docs' }].map(tab => (
                  <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id as any)} style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}>
                      <Text style={[styles.tabTxt, activeTab === tab.id && styles.tabTxtActive]}>{tab.label}</Text>
                      {activeTab === tab.id && <View style={styles.tabLine} />}
                  </TouchableOpacity>
              ))}
          </View>
          <View style={styles.mainBody}>
              {activeTab === 'vision' && renderVisionTab()}
              {activeTab === 'tech' && renderTechTab()}
              {activeTab === 'docs' && renderDocsTab()}
          </View>
      </Animated.ScrollView>

      {/* 4. FOOTER (Investir) */}
      <View style={styles.footer}>
          <View style={styles.footerInfo}>
              <Text style={styles.footerLabel}>Mon ticket</Text>
              <Text style={styles.footerVal}>{investAmount.toLocaleString()} €</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn}>
              <Text style={styles.ctaTxt}>Investir</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  
  // HEADER
  headerAbsolute: { 
    position: 'absolute', top: 0, left: 0, right: 0, 
    height: HEADER_HEIGHT, overflow: 'hidden', zIndex: 0 
  },
  headerImage: { width: '100%', height: HEADER_HEIGHT + 50, resizeMode: 'cover' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },
  
  // NAVBAR STYLES (CORRIGÉS POUR VISIBILITÉ)
  navBar: { 
      position: 'absolute', // Force la position absolue par dessus tout
      top: 0, left: 0, right: 0,
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingTop: Platform.OS === 'android' ? 40 : 10, // Gestion SafeArea manuelle
      zIndex: 100,
      elevation: 10 // Important pour Android
  },
  circleBtn: { 
      width: 44, height: 44, borderRadius: 22, 
      backgroundColor: 'white', 
      alignItems: 'center', justifyContent: 'center', 
      ...shadows.sm,
  },
  navRight: { flexDirection: 'row', gap: 12 },

  // HERO CONTENT
  heroContent: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusBadge: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
  sectorBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sectorText: { color: 'white', fontSize: 11, fontWeight: '600' },
  projectTitle: { fontSize: 36, fontWeight: '800', color: 'white', marginBottom: 4 },
  projectLoc: { fontSize: 14, color: '#BAE6FD', marginBottom: 20 },
  
  progressCard: { backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  raisedTxt: { fontSize: 20, fontWeight: '700', color: 'white' },
  percentTxt: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8 },
  fill: { height: '100%', backgroundColor: ACCENT_COLOR, borderRadius: 3 },
  metaTxt: { fontSize: 12, color: '#CBD5E1' },

  // TABS & CONTENT
  tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', ...shadows.sm },
  tabBtn: { marginRight: 24, paddingVertical: 18, position: 'relative' },
  tabBtnActive: {}, // Style vide pour éviter l'erreur TS
  tabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
  tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },
  
  mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
  tabContent: { gap: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, ...shadows.sm },
  hookText: { fontSize: 19, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  bodyText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  
  timelineContainer: { marginTop: 24, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: '#E2E8F0', marginLeft: 6 },
  timelineItem: { flexDirection: 'row', marginBottom: 24, paddingLeft: 16 },
  timelineDot: { position:'absolute', left: -5, width: 9, height: 9, borderRadius: 5, marginTop: 6 },
  timelineContent: { flex: 1 },
  timelineYear: { fontSize: 12, fontWeight: '700', color: THEME_COLOR },
  timelineTitle: { fontSize: 15, color: '#334155', fontWeight: '500' },
  
  mapCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, ...shadows.sm },
  mapWrap: { height: 160, borderRadius: 12, overflow: 'hidden', marginTop: 12, marginBottom: 12 },
  addressText: { fontSize: 13, color: '#64748B', textAlign: 'center' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 12, ...shadows.sm, borderTopWidth: 4, borderTopColor: THEME_COLOR },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  kpiLabel: { fontSize: 12, color: '#64748B' },
  
  chartContainer: { backgroundColor: 'white', padding: 20, borderRadius: 16, ...shadows.sm },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barWrapper: { alignItems: 'center', width: '20%' },
  barFill: { width: '80%', borderRadius: 4, marginBottom: 8 },
  barLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  barValue: { position: 'absolute', top: -20, fontSize: 10, fontWeight: '700', color: THEME_COLOR },

  simBox: { backgroundColor: 'white', borderRadius: 16, padding: 20, ...shadows.md, borderWidth:1, borderColor:'#E2E8F0' },
  modeSelector: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 4, borderRadius: 10, marginBottom: 20 },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  modeBtnActive: { backgroundColor: THEME_COLOR },
  modeLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plusMinus: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth:1, borderColor: '#BAE6FD' },
  investBigAmount: { fontSize: 26, fontWeight: '800', color: '#0F172A' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  teamCard: { width: 150, backgroundColor: 'white', padding: 14, borderRadius: 12, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#E2E8F0' },
  teamAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 10, backgroundColor: '#E2E8F0' },
  teamName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR },
  
  docList: { gap: 12 },
  docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 12, gap: 14, borderWidth: 1, borderColor: '#E2E8F0', ...shadows.sm },
  docIcon: { width: 40, height: 40, backgroundColor: '#F0F9FF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  docMeta: { fontSize: 12, color: '#94A3B8' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 12, color: '#64748B' },
  footerVal: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14, ...shadows.glow },
  ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet2;