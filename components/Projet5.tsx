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

// 🌿 THÈME GREEN / AGRITECH
const THEME_COLOR = "#16A34A"; // Green 600
const ACCENT_COLOR = "#4ADE80"; // Green 400
const BG_COLOR = "#F0FDF4"; // Fond vert très pâle

// --- DATA MODEL (BioFood Chain) ---
const PROJECT_DATA = {
    id: "biofood-chain-01",
    name: "BioFood Chain",
    tagline: "La traçabilité alimentaire infalsifiable via Blockchain.",
    sector: "AgriTech / Green",
    location: "Bordeaux, Nouvelle-Aquitaine",
    status: "Collecte en cours",
    badges: ["Label B-Corp", "French Tech Agri20"],

    // Metrics Hero
    raised: 1200000,
    target: 2000000,
    investors: 310,
    daysLeft: 35,
    minTicket: 100,
    valuationPre: "6.2M€",

    // Story
    story_hook: "83% des consommateurs ne font plus confiance aux étiquettes.",
    story_text: "Scandales sanitaires, fausses origines, greenwashing... BioFood Chain restaure la confiance. Notre plateforme blockchain permet de suivre chaque produit de la ferme à l'assiette. Le consommateur scanne un QR Code et voit tout l'historique vérifié.",

    // Data
    financials: {
        revenue: [
            { year: '2023', value: 0.4, label: 'Amorçage' },
            { year: '2024', value: 1.2, label: 'Lancement' },
            { year: '2025', value: 3.5, label: 'Expansion' },
            { year: '2026', value: 8.0, label: 'Scale-up' }
        ],
        allocation: [
            { label: "R&D Blockchain", percent: 40, color: "#15803D" }, // Dark Green
            { label: "Sales & Partenariats", percent: 35, color: "#16A34A" }, // Main Green
            { label: "Marketing B2C", percent: 15, color: "#86EFAC" }, // Light Green
            { label: "Opérations", percent: 10, color: "#9CA3AF" }, // Grey
        ],
        kpi: [
            { label: "Agriculteurs", value: "450+" },
            { label: "Produits tracés", value: "1.2M" },
            { label: "CO2 Évité", value: "150t" },
            { label: "Rendement", value: "9.5%" },
        ]
    },
    team: [
        { name: "Camille V.", role: "CEO", bio: "Ingénieure Agro, ex-Danone.", img: "https://randomuser.me/api/portraits/women/65.jpg" },
        { name: "Lucas M.", role: "CTO", bio: "Expert Blockchain, PhD.", img: "https://randomuser.me/api/portraits/men/22.jpg" },
        { name: "Antoine D.", role: "Supply Chain", bio: "Ex-Carrefour Logistique.", img: "https://randomuser.me/api/portraits/men/54.jpg" },
    ],
    documents: [
        { title: "Whitepaper Technique", type: "PDF", size: "3.5 Mo", locked: false },
        { title: "Rapport d'Impact RSE", type: "PDF", size: "8.1 Mo", locked: true },
        { title: "Business Plan 2026", type: "PDF", size: "4.2 Mo", locked: true },
    ],
    timeline: [
        { date: "2022", title: "POC en Aquitaine", active: true },
        { date: "2023", title: "Partenariat Coopératives", active: true },
        { date: "2024", title: "App Mobile Grand Public", active: true },
        { date: "2025", title: "Expansion Europe du Sud", active: false },
    ]
};

// --- COMPOSANTS UI ---

const ChartBar = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Prévisionnel CA (M€)</Text>
            <View style={styles.barChartRow}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <View style={[styles.barFill, { height: Math.max(10, (item.value / maxVal) * 100), backgroundColor: index > 1 ? ACCENT_COLOR : THEME_COLOR }]} />
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
        {icon && <Feather name={icon as any} size={18} color={THEME_COLOR} style={{ marginRight: 8 }} />}
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

// --- MAIN SCREEN ---
const Projet5: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"vision" | "impact" | "docs">("vision");
    const [investMode, setInvestMode] = useState<"equity" | "royalty" | "impact">("equity");
    const [investAmount, setInvestAmount] = useState(500);
    const [isLiked, setIsLiked] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;

    // Simulation logic
    const getSimResult = () => {
        if (investMode === 'equity') return { label: "Parts (BSA-AIR)", val: "0.008%" };
        if (investMode === 'royalty') return { label: "Royalties / an", val: "48 €" }; // 9.5% approx
        return { label: "Impact CO2", val: "-120 kg" };
    };
    const sim = getSimResult();

    // Animation Header
    const headerTranslateY = scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT / 2.5], extrapolate: 'clamp' });
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

    // --- RENDU ONGLETS ---

    const renderVisionTab = () => (
        <View style={styles.tabContent}>
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

            <View style={styles.mapCard}>
                <SectionHeader title="Fermes Partenaires" icon="map-pin" />
                <View style={styles.mapWrap}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: 44.8378, longitude: -0.5792, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
                        scrollEnabled={false} zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: 44.8378, longitude: -0.5792 }} pinColor={THEME_COLOR} />
                        {/* Fake markers around Bordeaux */}
                        <Marker coordinate={{ latitude: 44.9, longitude: -0.4 }} pinColor={THEME_COLOR} />
                        <Marker coordinate={{ latitude: 44.7, longitude: -0.7 }} pinColor={THEME_COLOR} />
                    </MapView>
                </View>
                <Text style={styles.addressText}>{PROJECT_DATA.location} et alentours</Text>
            </View>
        </View>
    );

    const renderImpactTab = () => (
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

            {/* Sim Box */}
            <View style={styles.simBox}>
                <SectionHeader title="Simulateur d'Investissement" icon="activity" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'equity', label: 'Actions' },
                        { id: 'royalty', label: 'Royalties' },
                        { id: 'impact', label: 'Impact' }
                    ].map((m) => (
                        <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)}
                            style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                            <Text style={[styles.modeLabel, investMode === m.id && { color: 'white' }]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(100, p - 100))} style={styles.plusMinus}><Feather name="minus" size={20} color={THEME_COLOR} /></TouchableOpacity>
                    <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                    <TouchableOpacity onPress={() => setInvestAmount(p => p + 100)} style={styles.plusMinus}><Feather name="plus" size={20} color={THEME_COLOR} /></TouchableOpacity>
                </View>

                <View style={styles.simResult}>
                    <View>
                        <Text style={styles.simResLabel}>Retour estimé</Text>
                        <Text style={styles.simResVal}>{sim.val}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.simResLabel}>Type</Text>
                        <Text style={[styles.simResVal, { color: colors.textSecondary, fontSize: 16 }]}>{sim.label}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderDocsTab = () => (
        <View style={styles.tabContent}>
            <SectionHeader title="La Team" icon="users" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {PROJECT_DATA.team.map((m, i) => (
                    <View key={i} style={styles.teamCard}>
                        <Image source={{ uri: m.img }} style={styles.teamAvatar} />
                        <Text style={styles.teamName}>{m.name}</Text>
                        <Text style={styles.teamRole}>{m.role}</Text>
                    </View>
                ))}
            </ScrollView>

            <SectionHeader title="Documents & RSE" icon="file-text" />
            <View style={styles.docList}>
                {PROJECT_DATA.documents.map((doc, i) => (
                    <TouchableOpacity key={i} style={styles.docRow}>
                        <View style={styles.docIcon}><Feather name="file-text" size={20} color={THEME_COLOR} /></View>
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
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            {/* 1. HEADER AVEC IMAGE DE FOND (z-index bas) */}
            <View style={styles.headerAbsolute}>
                <Animated.Image
                    source={{ uri: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(21, 128, 61, 0.4)', 'rgba(20, 83, 45, 0.8)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

                <Animated.View style={[styles.heroContent, { opacity: headerOpacity }]}>
                    <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}><Text style={styles.statusText}>{PROJECT_DATA.status}</Text></View>
                        <View style={styles.sectorBadge}><Text style={styles.sectorText}>{PROJECT_DATA.sector}</Text></View>
                    </View>
                    <Text style={styles.projectTitle}>{PROJECT_DATA.name}</Text>
                    <Text style={styles.projectLoc}><Feather name="map-pin" size={14} /> {PROJECT_DATA.location}</Text>

                    <View style={styles.progressCard}>
                        <View style={styles.progressStats}>
                            <Text style={styles.raisedTxt}>{(PROJECT_DATA.raised / 1000000).toFixed(1)}M€</Text>
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

            {/* 2. NAVIGATION BAR (z-index HAUT, Position Absolue) */}
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

            {/* 3. CONTENU SCROLLABLE */}
            <Animated.ScrollView
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 30, paddingBottom: 120 }}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
            >
                {/* TABS */}
                <View style={styles.tabsContainer}>
                    {[
                        { id: 'vision', label: 'Vision' },
                        { id: 'impact', label: 'Impact & Data' },
                        { id: 'docs', label: 'Docs' }
                    ].map(tab => (
                        <TouchableOpacity key={tab.id} onPress={() => { Haptics.selectionAsync(); setActiveTab(tab.id as any); }} style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}>
                            <Text style={[styles.tabTxt, activeTab === tab.id && styles.tabTxtActive]}>{tab.label}</Text>
                            {activeTab === tab.id && <View style={styles.tabLine} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* CORPS */}
                <View style={styles.mainBody}>
                    {activeTab === 'vision' && renderVisionTab()}
                    {activeTab === 'impact' && renderImpactTab()}
                    {activeTab === 'docs' && renderDocsTab()}
                </View>
            </Animated.ScrollView>

            {/* 4. FOOTER */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Mon investissement</Text>
                    <Text style={styles.footerVal}>{investAmount.toLocaleString()} € <Text style={styles.footerMode}>({investMode === 'royalty' ? 'Royalties' : investMode === 'equity' ? 'Actions' : 'Impact'})</Text></Text>
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

    // NAVBAR CORRIGÉE
    navBar: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        zIndex: 100, // Important
        elevation: 10
    },
    circleBtn: {
        width: 44,
        height: 44,
        backgroundColor: colors.white,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    navRight: { flexDirection: 'row', gap: 12 },

    // HERO CONTENT
    heroContent: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statusBadge: { backgroundColor: THEME_COLOR, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
    sectorBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    sectorText: { color: 'white', fontSize: 11, fontWeight: '600' },
    projectTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
    projectLoc: { fontSize: 14, color: '#DCFCE7', marginBottom: 20 },

    progressCard: { backgroundColor: 'rgba(20, 83, 45, 0.7)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
    raisedTxt: { fontSize: 18, fontWeight: '700', color: 'white' },
    percentTxt: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
    track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 8 },
    fill: { height: '100%', backgroundColor: ACCENT_COLOR, borderRadius: 3 },
    metaRow: { flexDirection: 'row', gap: 8 },
    metaTxt: { fontSize: 12, color: '#F0FDF4' },

    // TABS
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#86EFAC' },
    tabBtn: { marginRight: 24, paddingVertical: 20, position: 'relative' },
    tabBtnActive: {},
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    hookText: { fontSize: 18, fontWeight: '700', color: '#14532D', marginBottom: 12, lineHeight: 26 },
    bodyText: { fontSize: 15, color: '#4B5563', lineHeight: 24 },

    timelineContainer: { marginTop: 24, paddingLeft: 8 },
    timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4, zIndex: 1 },
    timelineContent: { flex: 1 },
    timelineYear: { fontSize: 12, fontWeight: '700', color: THEME_COLOR },
    timelineTitle: { fontSize: 14, color: '#374151', fontWeight: '500' },

    mapCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, ...shadows.sm },
    mapWrap: { height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 12, marginBottom: 12 },
    addressText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },

    // FINANCE
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, ...shadows.sm, borderTopWidth: 4, borderTopColor: THEME_COLOR },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#14532D', marginBottom: 4 },
    kpiLabel: { fontSize: 12, color: '#6B7280' },

    chartContainer: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },
    chartTitle: { fontSize: 16, fontWeight: '700', color: '#14532D', marginBottom: 16 },
    barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
    barWrapper: { alignItems: 'center', width: '20%' },
    barFill: { width: '100%', borderRadius: 6, marginBottom: 8 },
    barLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
    barValue: { position: 'absolute', top: -20, fontSize: 10, fontWeight: '700', color: THEME_COLOR },

    simBox: { backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#86EFAC' },
    modeSelector: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 4, borderRadius: 12, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#86EFAC' },
    investBigAmount: { fontSize: 24, fontWeight: '800', color: THEME_COLOR },
    simResult: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' },
    simResLabel: { fontSize: 12, color: '#6B7280' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },

    // TEAM & DOCS
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#14532D' },
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F3F4F6' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: '#E2E8F0' },
    teamName: { fontSize: 14, fontWeight: '700', color: '#14532D', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },
    
    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F3F4F6', ...shadows.sm },
    docIcon: { width: 36, height: 36, backgroundColor: '#DCFCE7', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#14532D' },
    docMeta: { fontSize: 12, color: '#64748B' },

    // FOOTER
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: '#64748B' },
    footerVal: { fontSize: 18, fontWeight: '800', color: '#14532D' },
    footerMode: { fontSize: 14, fontWeight: '400', color: '#9CA3AF' },
    ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, ...shadows.glow },
    ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet5;