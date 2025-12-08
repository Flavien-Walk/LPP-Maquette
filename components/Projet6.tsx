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

// 🟣 THÈME VIRTUAL / PROPTECH
const THEME_COLOR = "#4F46E5"; // Indigo 600
const ACCENT_COLOR = "#818CF8"; // Indigo 400
const BG_COLOR = "#EEF2FF"; // Fond indigo très pâle

// --- DATA MODEL (Virtual Estate) ---
const PROJECT_DATA = {
    id: "virtual-estate-01",
    name: "Virtual Estate",
    tagline: "La première foncière dédiée au Metaverse.",
    sector: "PropTech / Web3",
    location: "Marseille, PACA",
    status: "Forte Demande",
    badges: ["Blockchain", "Yield 10%"],

    // Metrics Hero
    raised: 3200000,
    target: 4800000,
    investors: 950,
    daysLeft: 8,
    minTicket: 500,
    valuationPre: "12M€",

    // Story
    story_hook: "Le m² virtuel rapporte déjà plus que le m² parisien.",
    story_text: "Les plus grandes marques (Gucci, Nike, HSBC) s'arrachent les emplacements dans Decentraland et The Sandbox. Virtual Estate acquiert, aménage et loue des parcelles stratégiques (Malls, Event Centers) pour générer des loyers numériques à haut rendement.",

    // Data
    financials: {
        revenue: [
            { year: '2023', value: 0.5, label: 'Lancement' },
            { year: '2024', value: 1.8, label: 'Loyers Web3' },
            { year: '2025', value: 4.2, label: 'Expansion' },
            { year: '2026', value: 9.5, label: 'Maturité' }
        ],
        allocation: [
            { label: "Achat LANDs", percent: 50, color: "#4338CA" }, // Dark Indigo
            { label: "Développement 3D", percent: 30, color: "#4F46E5" }, // Main
            { label: "Marketing", percent: 15, color: "#A5B4FC" }, // Light
            { label: "Legal & Crypto", percent: 5, color: "#94A3B8" }, // Grey
        ],
        kpi: [
            { label: "Yield Moyen", value: "10.2%" },
            { label: "Parcelles", value: "124" },
            { label: "Locataires", value: "58" },
            { label: "Occupation", value: "92%" },
        ]
    },
    team: [
        { name: "Kevin M.", role: "CEO", bio: "Expert Crypto & Immobilier.", img: "https://randomuser.me/api/portraits/men/15.jpg" },
        { name: "Léa S.", role: "Lead Architect", bio: "Designer 3D Voxel.", img: "https://randomuser.me/api/portraits/women/22.jpg" },
        { name: "Marc D.", role: "Asset Manager", bio: "Ex-Unibail RW.", img: "https://randomuser.me/api/portraits/men/66.jpg" },
    ],
    documents: [
        { title: "Valorisation du Portfolio", type: "PDF", size: "4.1 Mo", locked: false },
        { title: "Smart Contracts Audit", type: "PDF", size: "2.5 Mo", locked: true },
        { title: "Roadmap Metaverse 2026", type: "PDF", size: "9.0 Mo", locked: true },
    ],
    timeline: [
        { date: "2021", title: "Premiers achats LAND", active: true },
        { date: "2022", title: "Construction Mall", active: true },
        { date: "2023", title: "Partenariats Marques", active: true },
        { date: "2025", title: "DAO Gouvernance", active: false },
    ]
};

// --- COMPOSANTS UI ---

const ChartBar = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Revenus Locatifs Web3 (M€)</Text>
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
const Projet6: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"vision" | "market" | "docs">("vision");
    const [investMode, setInvestMode] = useState<"token" | "equity" | "yield">("token");
    const [investAmount, setInvestAmount] = useState(1000);
    const [isLiked, setIsLiked] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;

    // Simulation logic
    const getSimResult = () => {
        if (investMode === 'token') return { label: "Tokens VEST", val: "2,500" };
        if (investMode === 'equity') return { label: "Parts Société", val: "0.008%" };
        return { label: "Rente estimée/an", val: "102 €" }; // 10.2% yield
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
                <SectionHeader title="QG Marseille" icon="map-pin" />
                <View style={styles.mapWrap}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: 43.2965, longitude: 5.3698, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        scrollEnabled={false} zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: 43.2965, longitude: 5.3698 }} pinColor={THEME_COLOR} />
                    </MapView>
                </View>
                <Text style={styles.addressText}>{PROJECT_DATA.location}</Text>
            </View>
        </View>
    );

    const renderMarketTab = () => (
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
                <SectionHeader title="Simulateur Web3" icon="cpu" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'token', label: 'Token (ICO)' },
                        { id: 'equity', label: 'Equity' },
                        { id: 'yield', label: 'Staking' }
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
                        <Text style={styles.simResLabel}>Allocation</Text>
                        <Text style={styles.simResVal}>{sim.val}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.simResLabel}>Mode</Text>
                        <Text style={[styles.simResVal, { color: colors.textSecondary, fontSize: 16 }]}>{sim.label}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderDocsTab = () => (
        <View style={styles.tabContent}>
            <SectionHeader title="Core Team" icon="users" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {PROJECT_DATA.team.map((m, i) => (
                    <View key={i} style={styles.teamCard}>
                        <Image source={{ uri: m.img }} style={styles.teamAvatar} />
                        <Text style={styles.teamName}>{m.name}</Text>
                        <Text style={styles.teamRole}>{m.role}</Text>
                    </View>
                ))}
            </ScrollView>

            <SectionHeader title="Whitepaper & Audit" icon="file-text" />
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
                    source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(79, 70, 229, 0.4)', 'rgba(30, 27, 75, 0.8)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

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
                        { id: 'market', label: 'Marché' },
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
                    {activeTab === 'market' && renderMarketTab()}
                    {activeTab === 'docs' && renderDocsTab()}
                </View>
            </Animated.ScrollView>

            {/* 4. FOOTER */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Mon investissement</Text>
                    <Text style={styles.footerVal}>{investAmount.toLocaleString()} € <Text style={styles.footerMode}>({investMode === 'token' ? 'Tokens' : investMode === 'equity' ? 'Actions' : 'Staking'})</Text></Text>
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
    projectLoc: { fontSize: 14, color: '#C7D2FE', marginBottom: 20 },

    progressCard: { backgroundColor: 'rgba(30, 27, 75, 0.7)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
    raisedTxt: { fontSize: 18, fontWeight: '700', color: 'white' },
    percentTxt: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
    track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 8 },
    fill: { height: '100%', backgroundColor: ACCENT_COLOR, borderRadius: 3 },
    metaRow: { flexDirection: 'row', gap: 8 },
    metaTxt: { fontSize: 12, color: '#E0E7FF' },

    // TABS
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#A5B4FC' },
    tabBtn: { marginRight: 24, paddingVertical: 20, position: 'relative' },
    tabBtnActive: {},
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    hookText: { fontSize: 18, fontWeight: '700', color: '#312E81', marginBottom: 12, lineHeight: 26 },
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
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#312E81', marginBottom: 4 },
    kpiLabel: { fontSize: 12, color: '#6B7280' },

    chartContainer: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },
    chartTitle: { fontSize: 16, fontWeight: '700', color: '#312E81', marginBottom: 16 },
    barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
    barWrapper: { alignItems: 'center', width: '20%' },
    barFill: { width: '100%', borderRadius: 6, marginBottom: 8 },
    barLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
    barValue: { position: 'absolute', top: -20, fontSize: 10, fontWeight: '700', color: THEME_COLOR },

    simBox: { backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#C7D2FE' },
    modeSelector: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 4, borderRadius: 12, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A5B4FC' },
    investBigAmount: { fontSize: 24, fontWeight: '800', color: THEME_COLOR },
    simResult: { backgroundColor: '#EEF2FF', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' },
    simResLabel: { fontSize: 12, color: '#6B7280' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },

    // TEAM & DOCS
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#312E81' },
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F3F4F6' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: '#E2E8F0' },
    teamName: { fontSize: 14, fontWeight: '700', color: '#312E81', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },
    
    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F3F4F6', ...shadows.sm },
    docIcon: { width: 36, height: 36, backgroundColor: '#E0E7FF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#312E81' },
    docMeta: { fontSize: 12, color: '#6B7280' },

    // FOOTER
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: '#6B7280' },
    footerVal: { fontSize: 18, fontWeight: '800', color: '#312E81' },
    footerMode: { fontSize: 14, fontWeight: '400', color: '#9CA3AF' },
    ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, ...shadows.glow },
    ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet6;