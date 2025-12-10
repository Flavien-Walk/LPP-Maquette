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

// 🔵 THÈME FINTECH (Royal Blue)
const THEME_COLOR = "#2563EB"; // Blue 600
const ACCENT_COLOR = "#60A5FA"; // Blue 400
const BG_COLOR = "#F8FAFC"; // Slate 50

// --- DATA MODEL (FinFlow Systems) ---
const PROJECT_DATA = {
    // 1. En-tête & 2. Résumé
    id: "finflow-systems-01",
    name: "FinFlow Systems",
    tagline: "Plateforme de paiement nouvelle génération pour PME.",
    sector: "FinTech / B2B",
    location: "Paris, Station F",
    status: "Série A",
    badges: ["B2B SaaS", "API-First"],

    // Metrics Hero
    raised: 2100000,
    target: 2500000,
    investors: 287,
    daysLeft: 22,
    minTicket: 500,
    valuationPre: "12M€",
    valuationPost: "14.5M€",
    
    // 4. Description & Story
    story_hook: "Simplifier les paiements B2B pour les PME européennes.",
    story_text: "FinFlow est une plateforme de paiement qui permet aux PME de gérer leurs flux de trésorerie en temps réel. Avec une intégration en 15 minutes et des frais jusqu'à 3x moins chers que les acteurs traditionnels, FinFlow transforme la gestion financière des entreprises.",

    // 3. Graphiques & Data
    financials: {
        revenue: [
            { year: '2024', value: 0.3, label: '0.3M€' },
            { year: '2025', value: 1.2, label: '1.2M€' },
            { year: '2026', value: 3.8, label: '3.8M€ (Prév.)' },
            { year: '2027', value: 8.5, label: '8.5M€ (Prév.)' }
        ],
        allocation: [
            { label: "Tech & Product", percent: 45, color: "#2563EB" },
            { label: "Marketing & Sales", percent: 30, color: "#60A5FA" },
            { label: "Opérations", percent: 15, color: "#93C5FD" },
            { label: "Légal & Compliance", percent: 10, color: "#CBD5E1" },
        ],
        kpi: [
            { label: "ARR", value: "850K€" },
            { label: "Clients Actifs", value: "124" },
            { label: "Volume/mois", value: "45K" },
            { label: "Churn", value: "2.1%" },
        ]
    },

    // 5. Équipe
    team: [
        { name: "Thomas Durand", role: "CEO", bio: "Ex-Stripe, 8 ans FinTech.", linkedin: true, img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" },
        { name: "Sarah Chen", role: "CTO", bio: "Ex-PayPal Engineering.", linkedin: true, img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop" },
        { name: "Marc Lefebvre", role: "CFO", bio: "Ex-BNP Paribas.", linkedin: true, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    ],

    // 7. Data Room
    documents: [
        { title: "Pitch Deck Q4 2024", type: "PDF", size: "8.4 Mo", locked: false },
        { title: "Business Plan 2025-27", type: "PDF", size: "12.1 Mo", locked: true },
        { title: "Metrics Dashboard", type: "PDF", size: "3.2 Mo", locked: true },
        { title: "Statuts Juridiques", type: "PDF", size: "1.5 Mo", locked: true },
    ],

    // 14. Timeline
    timeline: [
        { date: "2022", title: "Fondation & MVP", active: true },
        { date: "2023", title: "Seed Round (1M€)", active: true },
        { date: "2024", title: "Série A (En cours)", active: true },
        { date: "2025", title: "Expansion EU", active: false },
    ]
};

// --- COMPOSANTS UI ---

const RevenueChart = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Projection Revenus (M€)</Text>
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
const Projet3: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"projet" | "finance" | "docs">("projet");
    const [investMode, setInvestMode] = useState<"equity" | "convertible" | "token">("equity");
    const [investAmount, setInvestAmount] = useState(5000);
    const [isLiked, setIsLiked] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;

    // Simulation logic
    const getSimResult = () => {
        if (investMode === 'equity') {
            const percent = (investAmount / 14500000 * 100).toFixed(4); // Basé sur post-money
            return { label: "Parts estimées", val: `${percent}%`, sub: "Valo. post-money 14.5M€" };
        }
        if (investMode === 'convertible') {
            return { label: "Cap Valorisation", val: "15 M€", sub: "Discount 20%" };
        }
        const tokens = Math.round(investAmount * 100);
        return { label: "Tokens Utility", val: `${tokens.toLocaleString()}`, sub: "Prix: 0.01€ / token" };
    };
    const sim = getSimResult();

    // Animation Header
    const headerTranslateY = scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT / 2.5], extrapolate: 'clamp' });
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

    // --- RENDU ONGLETS ---

    const renderProjectTab = () => (
        <View style={styles.tabContent}>
            {/* Vidéo Pitch (Ajouté pour parité avec Projet 1 & 2) */}
            <View style={styles.videoContainer}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800" }} style={styles.videoThumb} />
                <View style={styles.playBtn}><Feather name="play" size={32} color="white" /></View>
                <View style={styles.liveBadge}><Text style={styles.liveText}>PITCH CEO</Text></View>
            </View>

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

            {/* Social Proof (Ajouté) */}
            <View style={styles.proofRow}>
                <Text style={styles.proofLabel}>Vu sur :</Text>
                <Text style={styles.mediaLogo}>TechCrunch</Text>
                <Text style={styles.mediaLogo}>Maddyness</Text>
                <Text style={styles.mediaLogo}>Les Echos</Text>
            </View>

            <View style={styles.mapCard}>
                <SectionHeader title="Station F, Paris" icon="map-pin" />
                <View style={styles.mapWrap}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: 48.8338, longitude: 2.3722, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                        scrollEnabled={false} zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: 48.8338, longitude: 2.3722 }} pinColor={THEME_COLOR} />
                    </MapView>
                </View>
                <Text style={styles.addressText}>{PROJECT_DATA.location}</Text>
            </View>
        </View>
    );

    const renderFinanceTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.kpiGrid}>
                {PROJECT_DATA.financials.kpi.map((k, i) => (
                    <View key={i} style={styles.kpiBox}>
                        <Text style={styles.kpiValue}>{k.value}</Text>
                        <Text style={styles.kpiLabel}>{k.label}</Text>
                    </View>
                ))}
            </View>

            <RevenueChart data={PROJECT_DATA.financials.revenue} />
            {/* Allocation Chart (Ajouté, manquant dans la source initiale) */}
            <AllocationChart data={PROJECT_DATA.financials.allocation} />

            {/* Sim Box */}
            <View style={styles.simBox}>
                <SectionHeader title="Simulateur d'Investissement" icon="trending-up" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'equity', label: 'Actions', icon: 'pie-chart' },
                        { id: 'convertible', label: 'OCA', icon: 'file-text' },
                        { id: 'token', label: 'Tokens', icon: 'cpu' }
                    ].map((m) => (
                        <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)}
                            style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                            <Feather name={m.icon as any} size={14} color={investMode === m.id ? 'white' : '#64748B'} style={{marginRight:6}} />
                            <Text style={[styles.modeLabel, investMode === m.id && { color: 'white' }]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(500, p - 500))} style={styles.plusMinus}><Feather name="minus" size={20} color={THEME_COLOR} /></TouchableOpacity>
                    <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                    <TouchableOpacity onPress={() => setInvestAmount(p => p + 500)} style={styles.plusMinus}><Feather name="plus" size={20} color={THEME_COLOR} /></TouchableOpacity>
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
            <SectionHeader title="Équipe Fondatrice" icon="users" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {PROJECT_DATA.team.map((m, i) => (
                    <View key={i} style={styles.teamCard}>
                        <Image source={{ uri: m.img }} style={styles.teamAvatar} />
                        <Text style={styles.teamName}>{m.name}</Text>
                        <Text style={styles.teamRole}>{m.role}</Text>
                        {m.linkedin && <Feather name="linkedin" size={14} color="#0077B5" style={{ marginTop: 6 }} />}
                    </View>
                ))}
            </ScrollView>

            <SectionHeader title="Documents" icon="folder" />
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
            {/* Risk Card (Ajouté pour parité) */}
            <View style={styles.riskCard}>
                <Feather name="alert-triangle" size={20} color="#D97706" />
                <Text style={styles.riskText}>L'investissement en startups présente des risques de perte en capital. Diversifiez votre portefeuille. <Text style={{ textDecorationLine: 'underline' }}>En savoir plus.</Text></Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            {/* 1. HEADER AVEC IMAGE DE FOND */}
            <View style={styles.headerAbsolute}>
                <Animated.Image
                    source={{ uri: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(37, 99, 235, 0.3)', 'rgba(15, 23, 42, 0.8)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

                <Animated.View style={[styles.heroContent, { opacity: headerOpacity }]}>
                    <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}><View style={styles.dot} /><Text style={styles.statusText}>{PROJECT_DATA.status}</Text></View>
                        <View style={styles.sectorBadge}><Text style={styles.sectorText}>{PROJECT_DATA.sector}</Text></View>
                    </View>
                    <Text style={styles.projectTitle}>{PROJECT_DATA.name}</Text>
                    <Text style={styles.projectLoc}><Feather name="map-pin" size={14} /> {PROJECT_DATA.location}</Text>

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
                        { id: 'projet', label: 'Projet' },
                        { id: 'finance', label: 'Finance' },
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
                    {activeTab === 'projet' && renderProjectTab()}
                    {activeTab === 'finance' && renderFinanceTab()}
                    {activeTab === 'docs' && renderDocsTab()}
                </View>
            </Animated.ScrollView>

            {/* 4. FOOTER */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Mon investissement</Text>
                    <Text style={styles.footerVal}>{investAmount.toLocaleString()} € <Text style={styles.footerMode}>({investMode === 'equity' ? 'Actions' : investMode === 'convertible' ? 'OCA' : 'Tokens'})</Text></Text>
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

    // NAVBAR
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
    circleBtn: {
        width: 44, height: 44,
        backgroundColor: colors.white,
        borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        ...shadows.sm,
    },
    navRight: { flexDirection: 'row', gap: 12 },

    // HERO CONTENT
    heroContent: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white', marginRight: 6 },
    statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
    sectorBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sectorText: { color: 'white', fontSize: 11, fontWeight: '600' },
    projectTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
    projectLoc: { fontSize: 14, color: '#DBEAFE', marginBottom: 20 },

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
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    tabBtn: { marginRight: 24, paddingVertical: 20, position: 'relative' },
    tabBtnActive: {},
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    // VISION / PROJECT
    videoContainer: { height: 200, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' },
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

    proofRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, opacity: 0.6 },
    proofLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8', alignSelf: 'center' },
    mediaLogo: { fontSize: 14, fontWeight: '800', color: '#334155' },

    mapCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, ...shadows.sm },
    mapWrap: { height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 12, marginBottom: 12 },
    addressText: { fontSize: 13, color: '#64748B', textAlign: 'center' },

    // FINANCE
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, ...shadows.sm, borderTopWidth: 4, borderTopColor: THEME_COLOR },
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
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
    investBigAmount: { fontSize: 24, fontWeight: '800', color: '#1E3A8A' },
    simResult: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    simResLabel: { fontSize: 12, color: '#64748B' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },
    simResSub: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginBottom: 2 },
    badgeSim: { backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-end' },
    badgeSimText: { fontSize: 10, color: '#475569', fontWeight: '600' },

    // TEAM & DOCS
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: '#E2E8F0' },
    teamName: { fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },
    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F1F5F9', ...shadows.sm },
    docIcon: { width: 36, height: 36, backgroundColor: '#F0F9FF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    docMeta: { fontSize: 12, color: '#64748B' },
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

export default Projet3;