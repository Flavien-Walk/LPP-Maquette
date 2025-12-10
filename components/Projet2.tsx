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
import { colors, shadows } from "../styles/indexStyles";

// --- CONFIGURATION ---
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
const HEADER_HEIGHT = 420;

// 🔵 THÈME HEALTH TECH
const THEME_COLOR = "#0284C7"; // Sky 600
const ACCENT_COLOR = "#38BDF8"; // Sky 400
const BG_COLOR = "#F0F9FF"; // Fond bleu très pâle

// --- DATA MODEL (MEDTECH - STRUCTURE PROJET 1) ---
const PROJECT_DATA = {
    // 1. En-tête & 2. Résumé
    id: "media-diag-01",
    name: "MedIA Diag",
    tagline: "L'IA qui détecte les tumeurs 6 mois plus tôt.",
    sector: "HealthTech / AI",
    location: "Montpellier, MedVallée",
    status: "Derniers Jours",
    badges: ["DeepTech", "Label CE"],

    // Metrics Hero
    raised: 4200000,
    target: 4500000,
    investors: 852,
    daysLeft: 5,
    minTicket: 200,
    valuationPre: "22M€",
    valuationPost: "26.5M€",
    securityType: "Actions de Préférence",

    // 4. Description & Storytelling
    story_hook: "Chaque année, 12% des cancers sont diagnostiqués trop tard.",
    story_text: "Les radiologues sont submergés et la fatigue visuelle entraîne des erreurs évitables. MedIA Diag agit comme un 'second avis' instantané : notre algorithme Neural-X analyse les IRM en 0.4 seconde avec une précision supérieure à l'œil humain pour les micro-lésions.",

    // 3. Graphiques & Data
    financials: {
        revenue: [
            { year: '2023', value: 0.2, label: '0.2M€' },
            { year: '2024', value: 1.5, label: '1.5M€' },
            { year: '2025', value: 8.0, label: '8.0M€ (Prév.)' },
            { year: '2026', value: 24.0, label: '24M€ (Prév.)' }
        ],
        allocation: [
            { label: "R&D & Clinique", percent: 50, color: "#3B82F6" },
            { label: "Certification FDA", percent: 20, color: "#8B5CF6" },
            { label: "Sales Europe", percent: 20, color: "#06B6D4" },
            { label: "Legal & IP", percent: 10, color: "#64748B" },
        ],
        kpi: [
            { label: "Précision IA", value: "99.8%" },
            { label: "Hôpitaux", value: "45" },
            { label: "Vitesse", value: "0.4s" },
            { label: "Brevet", value: "Validé" },
        ]
    },

    // 5. Équipe
    team: [
        { name: "Dr. Alix Raynal", role: "CEO", bio: "Radiologue, ex-CHU. 15 ans d'xp.", linkedin: true, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop" },
        { name: "Karim Benzer", role: "CTO", bio: "Ex-Google DeepMind. PhD AI.", linkedin: true, img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop" },
        { name: "Sarah Cohen", role: "CMO", bio: "Oncologue & MBA HEC.", linkedin: true, img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" },
    ],

    // 7. Data Room (Documents)
    documents: [
        { title: "Deck Investisseur", type: "PDF", size: "5.4 Mo", locked: false },
        { title: "Résultats Cliniques Ph.2", type: "PDF", size: "8.1 Mo", locked: true },
        { title: "Dossier Certification FDA", type: "PDF", size: "15 Mo", locked: true },
        { title: "Pacte d'Actionnaires", type: "PDF", size: "1.2 Mo", locked: true },
    ],

    // 14. Timeline
    timeline: [
        { date: "2020", title: "Entraînement Algorithme", active: true },
        { date: "2022", title: "Certification CE Medical", active: true },
        { date: "2024", title: "Série A (Actuel)", active: true },
        { date: "2026", title: "Agrément FDA (USA)", active: false },
    ]
};

// --- COMPOSANTS UI ---

// Graphique à barres (Blue Theme)
const RevenueChart = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Prévisionnel ARR (Revenu Récurrent)</Text>
            <View style={styles.barChartRow}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <View style={[styles.barFill, { height: Math.max(10, (item.value / maxVal) * 100), backgroundColor: index > 1 ? ACCENT_COLOR : THEME_COLOR }]} />
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
const Projet2: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"vision" | "tech" | "docs">("vision");
    const [investMode, setInvestMode] = useState<"equity" | "tax" | "impact">("equity");
    const [investAmount, setInvestAmount] = useState(2000);
    const [isLiked, setIsLiked] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;

    // Calcul Simulation (Logique similaire Projet 1)
    const getSimResult = () => {
        if (investMode === 'equity') return { label: "Parts estimées", val: "0.0075%", sub: "Valo. post-money 26.5M€" };
        if (investMode === 'tax') return { label: "Réduction IR", val: "-500 €", sub: "Coût réel: 1500 €" };
        return { label: "Vies sauvées (est.)", val: "12", sub: "Impact direct algorithme" }; // Mode Impact spécifique MedTech
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
                <Image source={{ uri: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800" }} style={styles.videoThumb} />
                <View style={styles.playBtn}><Feather name="play" size={32} color="white" /></View>
                <View style={styles.liveBadge}><Text style={styles.liveText}>DEMO PRODUIT</Text></View>
            </View>

            {/* Storytelling */}
            <View style={styles.card}>
                <Text style={styles.hookText}>"{PROJECT_DATA.story_hook}"</Text>
                <Text style={styles.bodyText}>{PROJECT_DATA.story_text}</Text>

                <View style={styles.timelineContainer}>
                    {PROJECT_DATA.timeline.map((item, i) => (
                        <View key={i} style={styles.timelineItem}>
                            <View style={[styles.timelineDot, item.active ? { backgroundColor: THEME_COLOR } : { backgroundColor: '#E2E8F0' }]} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineYear}>{item.date}</Text>
                                <Text style={styles.timelineTitle}>{item.title}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Social Proof (MedTech Specific) */}
            <View style={styles.proofRow}>
                <Text style={styles.proofLabel}>Vu sur :</Text>
                <Text style={styles.mediaLogo}>Le Quotidien du Médecin</Text>
                <Text style={styles.mediaLogo}>Sifted</Text>
            </View>

            {/* Map */}
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
                <SectionHeader title="Simulateur d'Investissement" icon="sliders" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'equity', icon: 'trending-up', label: 'Action' },
                        { id: 'tax', icon: 'pie-chart', label: 'Défisc.' },
                        { id: 'impact', icon: 'activity', label: 'Impact' }
                    ].map((m) => (
                        <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)}
                            style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                            <Feather name={m.icon as any} size={16} color={investMode === m.id ? 'white' : colors.textSecondary} />
                            <Text style={[styles.modeLabel, investMode === m.id && { color: 'white' }]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(200, p - 200))} style={styles.plusMinus}><Feather name="minus" size={20} color={THEME_COLOR} /></TouchableOpacity>
                    <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                    <TouchableOpacity onPress={() => setInvestAmount(p => p + 200)} style={styles.plusMinus}><Feather name="plus" size={20} color={THEME_COLOR} /></TouchableOpacity>
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
            <SectionHeader title="Board Médical & Tech" icon="users" />
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
                <Text style={styles.riskText}>L'investissement en startups Deeptech présente un risque de perte en capital et d'illiquidité. <Text style={{ textDecorationLine: 'underline' }}>En savoir plus.</Text></Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            {/* 1. HEADER AVEC IMAGE DE FOND */}
            <View style={styles.headerAbsolute}>
                <Animated.Image
                    source={{ uri: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(2, 132, 199, 0.3)', 'rgba(15, 23, 42, 0.8)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

                {/* Contenu textuel Hero */}
                <Animated.View style={[styles.heroContent, { opacity: headerContentOpacity }]}>
                    <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}><View style={styles.dot} /><Text style={styles.statusText}>{PROJECT_DATA.status}</Text></View>
                        <View style={styles.sectorBadge}><Text style={styles.sectorText}>{PROJECT_DATA.sector}</Text></View>
                    </View>
                    <Text style={styles.projectTitle}>{PROJECT_DATA.name}</Text>
                    <Text style={styles.projectLoc}><Feather name="map-pin" size={14} /> {PROJECT_DATA.location}</Text>

                    {/* Progress Block (AJOUTÉ POUR MATCHER PROJET 1) */}
                    <View style={styles.progressCard}>
                        <View style={styles.progressStats}>
                            <Text style={styles.raisedTxt}>{(PROJECT_DATA.raised / 1000000).toFixed(1)}M€ <Text style={styles.targetTxt}>/ {(PROJECT_DATA.target / 1000000).toFixed(1)}M€</Text></Text>
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

            {/* 2. NAVIGATION BAR */}
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
                        { id: 'vision', label: 'Vision' },
                        { id: 'tech', label: 'Tech & Data' },
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
                    {activeTab === 'tech' && renderTechTab()}
                    {activeTab === 'docs' && renderDocsTab()}
                </View>
            </Animated.ScrollView>

            {/* 4. FOOTER CTA */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Mon investissement</Text>
                    <Text style={styles.footerVal}>{investAmount.toLocaleString()} € <Text style={styles.footerMode}>({investMode === 'tax' ? 'Défisc.' : investMode === 'impact' ? 'Impact' : 'Action'})</Text></Text>
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

    // NAVIGATION
    navBar: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        zIndex: 100,
        elevation: 10
    },
    navRight: { flexDirection: 'row', gap: 12 },
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
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white', marginRight: 6 },
    statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
    sectorBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sectorText: { color: 'white', fontSize: 11, fontWeight: '600' },

    projectTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
    projectLoc: { fontSize: 14, color: '#BAE6FD', marginBottom: 20 },

    progressCard: { backgroundColor: 'rgba(15, 23, 42, 0.7)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
    raisedTxt: { fontSize: 18, fontWeight: '700', color: 'white' },
    targetTxt: { fontSize: 14, color: '#94A3B8', fontWeight: '400' },
    percentTxt: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
    track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 8 },
    fill: { height: '100%', backgroundColor: ACCENT_COLOR, borderRadius: 3 },
    metaRow: { flexDirection: 'row', gap: 8 },
    metaTxt: { fontSize: 12, color: '#CBD5E1' },

    // TABS
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    tabBtn: { marginRight: 24, paddingVertical: 20, position: 'relative' },
    tabBtnActive: {},
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    // VISION
    videoContainer: { height: 200, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
    videoThumb: { width: '100%', height: '100%', opacity: 0.8 },
    playBtn: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' },
    liveBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: THEME_COLOR, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    liveText: { color: 'white', fontSize: 10, fontWeight: '800' },

    hookText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12, lineHeight: 26 },
    bodyText: { fontSize: 15, color: '#475569', lineHeight: 24 },

    timelineContainer: { marginTop: 24, paddingLeft: 8 },
    timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4, zIndex: 1 },
    timelineContent: { flex: 1 },
    timelineYear: { fontSize: 12, fontWeight: '700', color: THEME_COLOR },
    timelineTitle: { fontSize: 14, color: '#334155', fontWeight: '500' },

    proofRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, opacity: 0.7 },
    proofLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8', alignSelf: 'center' },
    mediaLogo: { fontSize: 14, fontWeight: '800', color: '#334155' },

    mapCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, ...shadows.sm },
    mapWrap: { height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 12, marginBottom: 12 },
    addressText: { fontSize: 13, color: '#64748B', textAlign: 'center' },

    // MARKET & CHARTS
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, ...shadows.sm },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    kpiLabel: { fontSize: 12, color: '#64748B' },

    chartContainer: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },
    chartTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
    barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
    barWrapper: { alignItems: 'center', width: '20%' },
    barFill: { width: '100%', borderRadius: 6, marginBottom: 8 },
    barLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
    barValue: { position: 'absolute', top: -20, fontSize: 10, fontWeight: '700', color: THEME_COLOR },

    allocationList: { gap: 12 },
    allocItem: {},
    allocLabel: { fontSize: 13, color: '#334155' },
    allocPercent: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
    allocTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
    allocFill: { height: '100%', borderRadius: 4 },

    simBox: { backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', ...shadows.md },
    modeSelector: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 4, borderRadius: 12, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
    investBigAmount: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
    simResult: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' },
    simResLabel: { fontSize: 12, color: '#64748B' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },
    simResSub: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginBottom: 2 },
    badgeSim: { backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-end' },
    badgeSimText: { fontSize: 10, color: '#475569', fontWeight: '600' },

    // DOCS & TEAM
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
    teamName: { fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },
    teamBio: { fontSize: 11, color: '#64748B', textAlign: 'center' },
    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    docIcon: { width: 36, height: 36, backgroundColor: '#F0F9FF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    docMeta: { fontSize: 12, color: '#94A3B8' },
    riskCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF7ED', padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#FED7AA' },
    riskText: { flex: 1, fontSize: 12, color: '#9A3412', lineHeight: 18 },

    // FOOTER
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: '#64748B' },
    footerVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    footerMode: { fontSize: 14, fontWeight: '400', color: '#94A3B8' },
    ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, ...shadows.glow },
    ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet2;