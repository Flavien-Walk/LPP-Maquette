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

// 🔵 THÈME FINTECH (Bleu / Tech)
const THEME_COLOR = "#0052FF"; // Bleu Primaire
const ACCENT_COLOR = "#00C6FF"; // Bleu Clair
const BG_COLOR = "#F8FAFC"; // Gris très pâle

// --- DATA MODEL (FinFlow Systems) ---
const PROJECT_DATA = {
    id: "finflow-systems-01",
    name: "FinFlow Systems",
    tagline: "Plateforme de paiement nouvelle génération pour PME.",
    sector: "FinTech / Paiements",
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
    
    // Story
    story_hook: "Simplifier les paiements B2B pour les PME européennes.",
    story_text: "FinFlow est une plateforme de paiement qui permet aux PME de gérer leurs flux de trésorerie en temps réel. Avec une intégration en 15 minutes et des frais jusqu'à 3x moins chers que les acteurs traditionnels, FinFlow transforme la gestion financière des entreprises.",

    // Data
    financials: {
        revenue: [
            { year: '2024', value: 0.3, label: '0.3M€' },
            { year: '2025', value: 1.2, label: '1.2M€' },
            { year: '2026', value: 3.8, label: '3.8M€' },
            { year: '2027', value: 8.5, label: '8.5M€' }
        ],
        allocation: [
            { label: "Tech & Développement", percent: 45, color: "#0052FF" },
            { label: "Marketing & Sales", percent: 30, color: "#00C6FF" },
            { label: "Opérations", percent: 15, color: "#60A5FA" },
            { label: "Légal & Conformité", percent: 10, color: "#94A3B8" },
        ],
        kpi: [
            { label: "ARR", value: "850K€" },
            { label: "Clients Actifs", value: "124" },
            { label: "Transaction/mois", value: "45K" },
            { label: "Churn", value: "2.1%" },
        ]
    },
    team: [
        { name: "Thomas Durand", role: "CEO & Co-founder", bio: "Ex-Stripe, 8 ans FinTech.", img: "https://randomuser.me/api/portraits/men/32.jpg" },
        { name: "Sarah Chen", role: "CTO", bio: "Ex-PayPal Engineering.", img: "https://randomuser.me/api/portraits/women/44.jpg" },
        { name: "Marc Lefebvre", role: "CFO", bio: "Ex-BNP Paribas.", img: "https://randomuser.me/api/portraits/men/67.jpg" },
    ],
    documents: [
        { title: "Pitch Deck Q4 2024", type: "PDF", size: "8.4 Mo", locked: false },
        { title: "Business Plan 2025-2027", type: "PDF", size: "12.1 Mo", locked: true },
        { title: "Metrics Dashboard", type: "PDF", size: "3.2 Mo", locked: true },
    ],
    timeline: [
        { date: "2022", title: "Fondation & MVP", active: true },
        { date: "2023", title: "Seed Round (1M€)", active: true },
        { date: "2024", title: "Série A (En cours)", active: true },
        { date: "2025", title: "Expansion EU", active: false },
    ]
};

// --- COMPOSANTS UI ---

const ChartBar = ({ data }: { data: any[] }) => {
    const maxVal = 10; // Scale manuelle pour l'exemple
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Projection Revenus (M€)</Text>
            <View style={styles.barChartRow}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <View style={[styles.barFill, { height: (item.value / maxVal) * 100 || 5, backgroundColor: THEME_COLOR }]} />
                        <Text style={styles.barLabel}>{item.year}</Text>
                        <Text style={styles.barValue}>{item.label}</Text>
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
            const percent = (investAmount / 12000000 * 100).toFixed(4);
            return { label: "Part Capital", val: `${percent}%` };
        }
        if (investMode === 'convertible') {
            return { label: "OCA @ 15M€", val: `${investAmount.toLocaleString()} €` };
        }
        const tokens = Math.round(investAmount * 100);
        return { label: "Tokens", val: `${tokens.toLocaleString()}` };
    };
    const sim = getSimResult();

    // Animation Header
    const headerTranslateY = scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT / 2.5], extrapolate: 'clamp' });
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

    // --- RENDU ONGLETS ---

    const renderProjectTab = () => (
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
                <SectionHeader title="Emplacement" icon="map-pin" />
                <View style={styles.mapWrap}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: 48.8338, longitude: 2.3722, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
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

            <ChartBar data={PROJECT_DATA.financials.revenue} />

            {/* Sim Box */}
            <View style={styles.simBox}>
                <SectionHeader title="Simulateur d'Investissement" icon="trending-up" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'equity', label: 'Actions' },
                        { id: 'convertible', label: 'OCA' },
                        { id: 'token', label: 'Tokens' }
                    ].map((m) => (
                        <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)}
                            style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                            <Text style={[styles.modeLabel, investMode === m.id && { color: 'white' }]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(500, p - 500))} style={styles.plusMinus}><Feather name="minus" size={20} color={THEME_COLOR}/></TouchableOpacity>
                    <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                    <TouchableOpacity onPress={() => setInvestAmount(p => p + 500)} style={styles.plusMinus}><Feather name="plus" size={20} color={THEME_COLOR}/></TouchableOpacity>
                </View>

                <View style={styles.simResult}>
                    <View>
                        <Text style={styles.simResLabel}>Vous recevez</Text>
                        <Text style={styles.simResVal}>{sim.val}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.simResLabel}>Type</Text>
                        <Text style={[styles.simResVal, { color: colors.textSecondary, fontSize: 16 }]}>{sim.label}</Text>
                    </View>
                </View>
                <Text style={styles.simDisclaimer}>*Valorisation pré-money à 12M€. Dilution selon termes finaux.</Text>
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
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            {/* 1. HEADER AVEC IMAGE DE FOND (z-index bas) */}
            <View style={styles.headerAbsolute}>
                <Animated.Image
                    source={{ uri: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

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
                        { id: 'projet', label: 'Le Projet' },
                        { id: 'finance', label: 'Financier' },
                        { id: 'docs', label: 'Documents' }
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

    // NAVBAR CORRIGÉE (AU DESSUS DE TOUT)
    navBar: {
        position: 'absolute', 
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        zIndex: 100, // Z-INDEX MAXIMAL
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
    projectLoc: { fontSize: 14, color: '#E0F2FE', marginBottom: 20 },

    progressCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
    raisedTxt: { fontSize: 18, fontWeight: '700', color: 'white' },
    percentTxt: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
    track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 8 },
    fill: { height: '100%', backgroundColor: ACCENT_COLOR, borderRadius: 3 },
    metaRow: { flexDirection: 'row', gap: 8 },
    metaTxt: { fontSize: 12, color: '#E2E8F0' },

    // TABS
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#BFDBFE' },
    tabBtn: { marginRight: 24, paddingVertical: 20, position: 'relative' },
    tabBtnActive: {},
    tabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    hookText: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12, lineHeight: 26 },
    bodyText: { fontSize: 15, color: '#475569', lineHeight: 24 },

    timelineContainer: { marginTop: 24, paddingLeft: 8 },
    timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4, zIndex: 1 },
    timelineContent: { flex: 1 },
    timelineYear: { fontSize: 12, fontWeight: '700', color: THEME_COLOR },
    timelineTitle: { fontSize: 14, color: '#334155', fontWeight: '500' },

    mapCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, ...shadows.sm },
    mapWrap: { height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 12, marginBottom: 12 },
    addressText: { fontSize: 13, color: '#64748B', textAlign: 'center' },

    // FINANCE
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, ...shadows.sm, borderTopWidth: 4, borderTopColor: THEME_COLOR },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    kpiLabel: { fontSize: 12, color: '#64748B' },

    chartContainer: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },
    chartTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
    barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
    barWrapper: { alignItems: 'center', width: '20%' },
    barFill: { width: '100%', borderRadius: 6, marginBottom: 8 },
    barLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
    barValue: { position: 'absolute', top: -20, fontSize: 10, fontWeight: '700', color: THEME_COLOR },

    simBox: { backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#BFDBFE' },
    modeSelector: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 4, borderRadius: 12, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#93C5FD' },
    investBigAmount: { fontSize: 24, fontWeight: '800', color: '#1E40AF' },
    simResult: { backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    simResLabel: { fontSize: 12, color: '#64748B' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },
    simDisclaimer: { fontSize: 10, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic', marginTop: 8 },

    // TEAM & DOCS
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: '#E2E8F0' },
    teamName: { fontSize: 14, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },
    
    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F1F5F9', ...shadows.sm },
    docIcon: { width: 36, height: 36, backgroundColor: '#DBEAFE', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    docMeta: { fontSize: 12, color: '#64748B' },

    // FOOTER
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: '#64748B' },
    footerVal: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    footerMode: { fontSize: 14, fontWeight: '400', color: '#94A3B8' },
    ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, ...shadows.glow },
    ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet3;