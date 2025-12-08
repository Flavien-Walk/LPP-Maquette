import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
    UIManager,
    View
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import Feather from "react-native-vector-icons/Feather";
import { colors, shadows } from "../styles/indexStyles";

// --- CONFIGURATION ---
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 420;
const THEME_COLOR = "#047857"; // Emerald 700
const ACCENT_COLOR = "#10B981"; // Emerald 500

// --- DATA MODEL (17 POINTS COMPLIANT) ---
const PROJECT_DATA = {
    // 1. En-tête & 2. Résumé
    id: "green-lyon-01",
    name: "GreenTech Lyon",
    tagline: "L'énergie solaire 4.0 pour l'industrie européenne.",
    sector: "Energy / Infra",
    location: "Lyon, Auvergne-Rhône-Alpes",
    status: "Collecte en cours",
    badges: ["BPI France", "Label GreenFin"],

    // Metrics Hero
    raised: 1850000,
    target: 2500000,
    investors: 342,
    daysLeft: 12,
    minTicket: 500,
    valuationPre: "12M€",
    valuationPost: "14.5M€",
    securityType: "Actions Ordinaires",

    // 4. Description & Storytelling
    story_hook: "L'industrie européenne dort sur une mine d'or.",
    story_text: "Des millions de m² de toitures d'usines sont inexploités. En pleine crise énergétique, c'est une aberration économique et écologique. GreenTech ne se contente pas de poser des panneaux : nous transformons chaque usine en centrale autonome connectée, pilotée par IA pour maximiser la revente sur le réseau.",

    // 3. Graphiques & Data (Mock Data)
    financials: {
        revenue: [
            { year: '2023', value: 0.8, label: '0.8M€' },
            { year: '2024', value: 2.1, label: '2.1M€' },
            { year: '2025', value: 5.4, label: '5.4M€ (Prév.)' },
            { year: '2026', value: 12.0, label: '12M€ (Prév.)' }
        ],
        allocation: [
            { label: "R&D & Tech", percent: 40, color: "#3B82F6" },
            { label: "Sales & Marketing", percent: 30, color: "#10B981" },
            { label: "Recrutement", percent: 20, color: "#F59E0B" },
            { label: "Ops & Legal", percent: 10, color: "#6366F1" },
        ],
        kpi: [
            { label: "EBITDA 2026", value: "3.2M€" },
            { label: "Contrats Signés", value: "12" },
            { label: "Marge Brute", value: "45%" },
            { label: "LTV / CAC", value: "8.5" },
        ]
    },

    // 5. Équipe
    team: [
        { name: "Sophie Martin", role: "CEO", bio: "Ex-Directrice Engie, X-Mines.", linkedin: true, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
        { name: "Marc Dubois", role: "CTO", bio: "PhD Photovoltaïque.", linkedin: true, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
        { name: "Lea Zhang", role: "CFO", bio: "M&A Goldman Sachs.", linkedin: true, img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" },
    ],

    // 7. Data Room (Documents)
    documents: [
        { title: "Pitch Deck Investisseur", type: "PDF", size: "4.2 Mo", locked: false },
        { title: "États Financiers 2023", type: "PDF", size: "1.1 Mo", locked: true },
        { title: "Pacte d'Actionnaires", type: "PDF", size: "0.8 Mo", locked: true },
        { title: "Rapport Audit Technique", type: "PDF", size: "12 Mo", locked: true },
    ],

    // 14. Timeline
    timeline: [
        { date: "2021", title: "Création & R&D", active: true },
        { date: "2023", title: "POC Industriel validé", active: true },
        { date: "2024", title: "Levée Seed (Actuel)", active: true },
        { date: "2026", title: "Expansion EU", active: false },
    ]
};

// --- COMPOSANTS UI ---

// Graphique à barres simple (CSS Flex)
const RevenueChart = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Prévisionnel Chiffre d'Affaires</Text>
            <View style={styles.barChartRow}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <View style={[styles.barFill, { height: (item.value / maxVal) * 100, backgroundColor: index > 1 ? '#A7F3D0' : THEME_COLOR }]} />
                        <Text style={styles.barLabel}>{item.year}</Text>
                        <Text style={styles.barValue}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

// Allocation Funds (Barres horizontales)
const AllocationChart = ({ data }: { data: any[] }) => (
    <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Utilisation des Fonds</Text>
        <View style={styles.allocationList}>
            {data.map((item, index) => (
                <View key={index} style={styles.allocItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.allocLabel}>{item.label}</Text>
                        <Text style={styles.allocPercent}>{item.percent}%</Text>
                    </View>
                    <View style={styles.allocTrack}>
                        <View style={[styles.allocFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                    </View>
                </View>
            ))}
        </View>
    </View>
);

const SectionHeader = ({ title, icon }: { title: string, icon?: string }) => (
    <View style={styles.sectionHeader}>
        {icon && <Feather name={icon as any} size={18} color={THEME_COLOR} style={{ marginRight: 8 }} />}
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

// --- MAIN SCREEN ---
const Projet1: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"vision" | "market" | "docs">("vision");
    const [investMode, setInvestMode] = useState<"equity" | "tax" | "yield">("equity");
    const [investAmount, setInvestAmount] = useState(1000);
    const [isLiked, setIsLiked] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;

    // Calcul Simulation
    const getSimResult = () => {
        if (investMode === 'equity') return { label: "Parts estimées", val: "0.0083%", sub: "Valo. post-money 14.5M€" };
        if (investMode === 'tax') return { label: "Réduction IR", val: "-250 €", sub: "Coût réel: 750 €" };
        return { label: "Intérêts annuels", val: "70 €", sub: "Taux 7% / an" };
    };
    const sim = getSimResult();

    // Animation Header
    const headerTranslateY = scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT / 2.5], extrapolate: 'clamp' });
    const headerContentOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

    // --- RENDU ONGLETS ---

    const renderVisionTab = () => (
        <View style={styles.tabContent}>
            {/* Pitch Video Placeholder */}
            <View style={styles.videoContainer}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800" }} style={styles.videoThumb} />
                <View style={styles.playBtn}><Feather name="play" size={32} color="white" /></View>
                <View style={styles.liveBadge}><Text style={styles.liveText}>PITCH FONDATEUR</Text></View>
            </View>

            {/* Storytelling Revamped */}
            <View style={styles.card}>
                <Text style={styles.hookText}>"{PROJECT_DATA.story_hook}"</Text>
                <Text style={styles.bodyText}>{PROJECT_DATA.story_text}</Text>

                <View style={styles.timelineContainer}>
                    {PROJECT_DATA.timeline.map((item, i) => (
                        <View key={i} style={styles.timelineItem}>
                            <View style={[styles.timelineDot, item.active ? { backgroundColor: THEME_COLOR } : { backgroundColor: '#E5E7EB' }]} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineYear}>{item.date}</Text>
                                <Text style={styles.timelineTitle}>{item.title}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Social Proof */}
            <View style={styles.proofRow}>
                <Text style={styles.proofLabel}>Vu sur :</Text>
                <Text style={styles.mediaLogo}>Les Echos</Text>
                <Text style={styles.mediaLogo}>TechCrunch</Text>
                <Text style={styles.mediaLogo}>Maddyness</Text>
            </View>

            {/* Map */}
            <View style={styles.mapCard}>
                <SectionHeader title="Siège Social" icon="map-pin" />
                <View style={styles.mapWrap}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: 45.75, longitude: 4.85, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        scrollEnabled={false} zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: 45.75, longitude: 4.85 }} />
                    </MapView>
                </View>
                <Text style={styles.addressText}>{PROJECT_DATA.location}</Text>
            </View>
        </View>
    );

    const renderMarketTab = () => (
        <View style={styles.tabContent}>
            {/* KPI Grid */}
            <View style={styles.kpiGrid}>
                {PROJECT_DATA.financials.kpi.map((k, i) => (
                    <View key={i} style={styles.kpiBox}>
                        <Text style={styles.kpiValue}>{k.value}</Text>
                        <Text style={styles.kpiLabel}>{k.label}</Text>
                    </View>
                ))}
            </View>

            {/* Charts */}
            <RevenueChart data={PROJECT_DATA.financials.revenue} />
            <AllocationChart data={PROJECT_DATA.financials.allocation} />

            {/* Simulator Box */}
            <View style={styles.simBox}>
                <SectionHeader title="Simulateur de Gains" icon="sliders" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'equity', icon: 'trending-up', label: 'Action' },
                        { id: 'tax', icon: 'pie-chart', label: 'Défisc.' },
                        { id: 'yield', icon: 'dollar-sign', label: 'Rente' }
                    ].map((m) => (
                        <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)}
                            style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                            <Feather name={m.icon as any} size={16} color={investMode === m.id ? 'white' : colors.textSecondary} />
                            <Text style={[styles.modeLabel, investMode === m.id && { color: 'white' }]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(500, p - 500))} style={styles.plusMinus}><Feather name="minus" size={20} /></TouchableOpacity>
                    <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                    <TouchableOpacity onPress={() => setInvestAmount(p => p + 500)} style={styles.plusMinus}><Feather name="plus" size={20} /></TouchableOpacity>
                </View>

                <View style={styles.simResult}>
                    <View>
                        <Text style={styles.simResLabel}>{sim.label}</Text>
                        <Text style={styles.simResVal}>{sim.val}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.simResSub}>{sim.sub}</Text>
                        <View style={styles.badgeSim}><Text style={styles.badgeSimText}>Estimé</Text></View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderDocsTab = () => (
        <View style={styles.tabContent}>
            <SectionHeader title="Gouvernance & Équipe" icon="users" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {PROJECT_DATA.team.map((m, i) => (
                    <View key={i} style={styles.teamCard}>
                        <Image source={{ uri: m.img }} style={styles.teamAvatar} />
                        <Text style={styles.teamName}>{m.name}</Text>
                        <Text style={styles.teamRole}>{m.role}</Text>
                        <Text style={styles.teamBio} numberOfLines={3}>{m.bio}</Text>
                        {m.linkedin && <Feather name="linkedin" size={16} color="#0077B5" style={{ marginTop: 8 }} />}
                    </View>
                ))}
            </ScrollView>

            <SectionHeader title="Data Room" icon="folder" />
            <View style={styles.docList}>
                {PROJECT_DATA.documents.map((doc, i) => (
                    <TouchableOpacity key={i} style={styles.docRow}>
                        <View style={styles.docIcon}><Feather name="file-text" size={20} color={colors.textSecondary} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docTitle}>{doc.title}</Text>
                            <Text style={styles.docMeta}>{doc.type} • {doc.size}</Text>
                        </View>
                        {doc.locked ?
                            <Feather name="lock" size={18} color={colors.textTertiary} /> :
                            <Feather name="download" size={18} color={THEME_COLOR} />
                        }
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.riskCard}>
                <Feather name="alert-triangle" size={20} color="#D97706" />
                <Text style={styles.riskText}>L'investissement comporte des risques de perte partielle ou totale du capital. <Text style={{ textDecorationLine: 'underline' }}>En savoir plus.</Text></Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            {/* 1. HEADER AVEC IMAGE DE FOND (z-index: 0) */}
            <View style={styles.headerAbsolute}>
                <Animated.Image
                    source={{ uri: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', '#F9FAFB']} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

                {/* Contenu textuel Hero */}
                <Animated.View style={[styles.heroContent, { opacity: headerContentOpacity }]}>
                    <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}><View style={styles.dot} /><Text style={styles.statusText}>{PROJECT_DATA.status}</Text></View>
                        <View style={styles.sectorBadge}><Text style={styles.sectorText}>{PROJECT_DATA.sector}</Text></View>
                    </View>
                    <Text style={styles.projectTitle}>{PROJECT_DATA.name}</Text>
                    <Text style={styles.projectLoc}><Feather name="map-pin" size={14} /> {PROJECT_DATA.location}</Text>

                    {/* Progress Block */}
                    <View style={styles.progressCard}>
                        <View style={styles.progressStats}>
                            <Text style={styles.raisedTxt}>{(PROJECT_DATA.raised / 1000000).toFixed(2)}M€ <Text style={styles.targetTxt}>/ {(PROJECT_DATA.target / 1000000).toFixed(1)}M€</Text></Text>
                            <Text style={styles.percentTxt}>{percentRaised.toFixed(0)}%</Text>
                        </View>
                        <View style={styles.track}><View style={[styles.fill, { width: `${percentRaised}%` }]} /></View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaTxt}>{PROJECT_DATA.investors} investisseurs</Text>
                            <Text style={styles.metaTxt}>• J-{PROJECT_DATA.daysLeft}</Text>
                        </View>
                    </View>
                </Animated.View>
            </View>

            {/* 2. NAVIGATION BAR (FLOTTANTE et AU-DESSUS) */}
            <SafeAreaView style={styles.navBar} pointerEvents="box-none">
                <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                    <Feather name="arrow-left" size={22} color={colors.neutral900} />
                </TouchableOpacity>

                <View style={styles.navRight}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setIsLiked(!isLiked);
                        }}
                        style={styles.circleBtn}
                    >
                        <Feather
                            name="heart"
                            size={22}
                            color={isLiked ? "#EF4444" : colors.neutral900}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.circleBtn}>
                        <Feather name="share-2" size={22} color={colors.neutral900} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* 3. SCROLL CONTENT */}
            <Animated.ScrollView
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 30, paddingBottom: 120 }}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
            >
                {/* TABS SELECTOR */}
                <View style={styles.tabsContainer}>
                    {[
                        { id: 'vision', label: 'Projet & Vision' },
                        { id: 'market', label: 'Marché & Data' },
                        { id: 'docs', label: 'Équipe & Docs' }
                    ].map(tab => (
                        <TouchableOpacity key={tab.id} onPress={() => { Haptics.selectionAsync(); setActiveTab(tab.id as any); }} style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}>
                            <Text style={[styles.tabTxt, activeTab === tab.id && styles.tabTxtActive]}>{tab.label}</Text>
                            {activeTab === tab.id && <View style={styles.tabLine} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* TAB CONTENT RENDER */}
                <View style={styles.mainBody}>
                    {activeTab === 'vision' && renderVisionTab()}
                    {activeTab === 'market' && renderMarketTab()}
                    {activeTab === 'docs' && renderDocsTab()}
                </View>
            </Animated.ScrollView>

            {/* 4. FOOTER CTA */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Mon investissement</Text>
                    <Text style={styles.footerVal}>{investAmount.toLocaleString()} € <Text style={styles.footerMode}>({investMode === 'tax' ? 'Défisc.' : investMode === 'yield' ? 'Rente' : 'Action'})</Text></Text>
                </View>
                <TouchableOpacity style={styles.ctaBtn}>
                    <Text style={styles.ctaTxt}>Investir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },

    // HEADER
    headerAbsolute: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: HEADER_HEIGHT, overflow: 'hidden', zIndex: 0
    },
    headerImage: { width: '100%', height: HEADER_HEIGHT + 50, resizeMode: 'cover' },
    gradientOverlay: { ...StyleSheet.absoluteFillObject },

    // NAVIGATION CORRIGÉE (z-index élevé + position absolue)
    navBar: {
        position: 'absolute', // Indispensable pour être au-dessus
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        zIndex: 100, // Doit être > zIndex du headerAbsolute
        elevation: 10
    },
    navRight: { flexDirection: 'row', gap: 12 },
    // Style bouton rond blanc
    circleBtn: {
        width: 44,
        height: 44,
        backgroundColor: colors.white,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },

    heroContent: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white', marginRight: 6 },
    statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
    sectorBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sectorText: { color: 'white', fontSize: 11, fontWeight: '600' },

    projectTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
    projectLoc: { fontSize: 14, color: '#E5E7EB', marginBottom: 20 },

    progressCard: { backgroundColor: 'rgba(23, 23, 23, 0.8)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
    raisedTxt: { fontSize: 18, fontWeight: '700', color: 'white' },
    targetTxt: { fontSize: 14, color: '#9CA3AF', fontWeight: '400' },
    percentTxt: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
    track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 8 },
    fill: { height: '100%', backgroundColor: ACCENT_COLOR, borderRadius: 3 },
    metaRow: { flexDirection: 'row', gap: 8 },
    metaTxt: { fontSize: 12, color: '#D1D5DB' },

    // TABS
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    tabBtn: { marginRight: 24, paddingVertical: 20, position: 'relative' },
    tabBtnActive: {},
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    tabTxtActive: { color: '#111827', fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: '#F9FAFB' },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    // VISION
    videoContainer: { height: 200, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
    videoThumb: { width: '100%', height: '100%', opacity: 0.8 },
    playBtn: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' },
    liveBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    liveText: { color: 'white', fontSize: 10, fontWeight: '800' },

    hookText: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, lineHeight: 26 },
    bodyText: { fontSize: 15, color: '#4B5563', lineHeight: 24 },

    timelineContainer: { marginTop: 24, paddingLeft: 8 },
    timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4, zIndex: 1 },
    timelineContent: { flex: 1 },
    timelineYear: { fontSize: 12, fontWeight: '700', color: THEME_COLOR },
    timelineTitle: { fontSize: 14, color: '#374151', fontWeight: '500' },

    proofRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, opacity: 0.6 },
    proofLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', alignSelf: 'center' },
    mediaLogo: { fontSize: 14, fontWeight: '800', color: '#374151' },

    mapCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, ...shadows.sm },
    mapWrap: { height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 12, marginBottom: 12 },
    addressText: { fontSize: 13, color: '#4B5563', textAlign: 'center' },

    // MARKET & CHARTS
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, ...shadows.sm },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
    kpiLabel: { fontSize: 12, color: '#6B7280' },

    chartContainer: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },
    chartTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
    barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
    barWrapper: { alignItems: 'center', width: '20%' },
    barFill: { width: '100%', borderRadius: 6, marginBottom: 8 },
    barLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
    barValue: { position: 'absolute', top: -20, fontSize: 10, fontWeight: '700', color: THEME_COLOR },

    allocationList: { gap: 12 },
    allocItem: {},
    allocLabel: { fontSize: 13, color: '#374151' },
    allocPercent: { fontSize: 13, fontWeight: '700', color: '#111827' },
    allocTrack: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4 },
    allocFill: { height: '100%', borderRadius: 4 },

    simBox: { backgroundColor: '#ECFDF5', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D1FAE5' },
    modeSelector: { flexDirection: 'row', backgroundColor: 'white', padding: 4, borderRadius: 12, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', ...shadows.sm },
    investBigAmount: { fontSize: 22, fontWeight: '800', color: '#065F46' },
    simResult: { backgroundColor: 'white', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' },
    simResLabel: { fontSize: 12, color: '#6B7280' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },
    simResSub: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: 2 },
    badgeSim: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-end' },
    badgeSimText: { fontSize: 10, color: '#4B5563', fontWeight: '600' },

    // DOCS & TEAM
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F3F4F6' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
    teamName: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },
    teamBio: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    docIcon: { width: 36, height: 36, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
    docMeta: { fontSize: 12, color: '#9CA3AF' },
    riskCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FFFBEB', padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#FCD34D' },
    riskText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },

    // FOOTER
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: '#6B7280' },
    footerVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
    footerMode: { fontSize: 14, fontWeight: '400', color: '#9CA3AF' },
    ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, ...shadows.glow },
    ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet1;