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

// 🟣 THÈME SAAS / FINTECH (Purple)
const THEME_COLOR = "#7C3AED"; // Violet 600
const ACCENT_COLOR = "#A78BFA"; // Violet 400
const BG_COLOR = "#F5F3FF"; // Violet 50

// --- DATA MODEL (FinFlow Systems) ---
const PROJECT_DATA = {
    // 1. En-tête & 2. Résumé
    id: "finflow-systems-01",
    name: "FinFlow Systems",
    tagline: "L'OS financier tout-en-un pour les PME.",
    sector: "FinTech / SaaS",
    location: "La Défense, Paris",
    status: "Forte Traction",
    badges: ["Next40", "Agrément ACPR"],

    // Metrics Hero
    raised: 8500000,
    target: 12000000,
    investors: 1242,
    daysLeft: 24,
    minTicket: 2000,
    valuationPre: "45M€",
    valuationPost: "57M€",

    // 4. Description & Story
    story_hook: "Les PME perdent 15h par semaine sur des outils bancaires obsolètes.",
    story_text: "FinFlow unifie trésorerie, facturation et paiements dans une interface unique dopée à l'IA. Nous automatisons 80% des tâches comptables et offrons une visibilité cash en temps réel. Déjà adopté par 2500 entreprises leaders.",

    // 3. Graphiques & Data
    financials: {
        revenue: [
            { year: '2023', value: 2.1, label: '2.1M€' },
            { year: '2024', value: 5.8, label: '5.8M€' },
            { year: '2025', value: 14.5, label: '14.5M€ (Prév.)' },
            { year: '2026', value: 32.0, label: '32M€ (Prév.)' }
        ],
        allocation: [
            { label: "Product & Tech", percent: 45, color: "#6D28D9" },
            { label: "Sales & Marketing", percent: 35, color: "#8B5CF6" },
            { label: "Expansion Int.", percent: 15, color: "#C4B5FD" },
            { label: "Compliance", percent: 5, color: "#9CA3AF" },
        ],
        kpi: [
            { label: "Croissance", value: "+170%" },
            { label: "Clients", value: "2500+" },
            { label: "LTV / CAC", value: "5.2" },
            { label: "Churn", value: "< 2%" },
        ]
    },

    // 5. Équipe
    team: [
        { name: "David K.", role: "CEO", bio: "Ex-Goldman Sachs, Serial Entrepreneur.", linkedin: true, img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop" },
        { name: "Sarah L.", role: "CTO", bio: "Ex-Lead Dev Revolut. Polytech.", linkedin: true, img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" },
        { name: "Marc P.", role: "CRO", bio: "Ex-Salesforce VP Sales.", linkedin: true, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    ],

    // 7. Data Room
    documents: [
        { title: "Deck Investisseur Series A", type: "PDF", size: "5.5 Mo", locked: false },
        { title: "Reporting Financier Q3", type: "PDF", size: "2.1 Mo", locked: true },
        { title: "Audit Technique (Code)", type: "PDF", size: "8.2 Mo", locked: true },
        { title: "Agrément Bancaire", type: "PDF", size: "1.4 Mo", locked: true },
    ],

    // 14. Timeline
    timeline: [
        { date: "2021", title: "Lancement Bêta", active: true },
        { date: "2022", title: "Seed 3M€", active: true },
        { date: "2023", title: "Agrément Bancaire", active: true },
        { date: "2025", title: "Expansion UK/DE", active: false },
    ]
};

// --- COMPOSANTS UI ---

const RevenueChart = ({ data }: { data: any[] }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Évolution du Revenu (ARR)</Text>
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
const Projet4: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"vision" | "finance" | "docs">("vision");
    const [investMode, setInvestMode] = useState<"equity" | "tax" | "bond">("equity");
    const [investAmount, setInvestAmount] = useState(2000);
    const [isLiked, setIsLiked] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const percentRaised = (PROJECT_DATA.raised / PROJECT_DATA.target) * 100;

    // Simulation logic
    const getSimResult = () => {
        if (investMode === 'equity') {
            const percent = (investAmount / 57000000 * 100).toFixed(5);
            return { label: "Parts estimées", val: `${percent}%`, sub: "Valo. post-money 57M€" };
        }
        if (investMode === 'tax') {
            return { label: "Réduction IR", val: "-500 €", sub: "Dispositif JEI" };
        }
        return { label: "Intérêts annuels", val: "140 €", sub: "Taux 7% (Obligation)" };
    };
    const sim = getSimResult();

    // Animation Header
    const headerTranslateY = scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT / 2.5], extrapolate: 'clamp' });
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' });

    // --- RENDU ONGLETS ---

    const renderVisionTab = () => (
        <View style={styles.tabContent}>
            {/* Vidéo Pitch (Ajouté) */}
            <View style={styles.videoContainer}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" }} style={styles.videoThumb} />
                <View style={styles.playBtn}><Feather name="play" size={32} color="white" /></View>
                <View style={styles.liveBadge}><Text style={styles.liveText}>DÉMO PRODUIT</Text></View>
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
                <Text style={styles.proofLabel}>Ils en parlent :</Text>
                <Text style={styles.mediaLogo}>BFM Business</Text>
                <Text style={styles.mediaLogo}>Forbes</Text>
                <Text style={styles.mediaLogo}>Tech.eu</Text>
            </View>

            <View style={styles.mapCard}>
                <SectionHeader title="Siège - La Défense" icon="map-pin" />
                <View style={styles.mapWrap}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: 48.8924, longitude: 2.2361, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
                        scrollEnabled={false} zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: 48.8924, longitude: 2.2361 }} pinColor={THEME_COLOR} />
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
            {/* Allocation Chart (Ajouté) */}
            <AllocationChart data={PROJECT_DATA.financials.allocation} />

            {/* Sim Box */}
            <View style={styles.simBox}>
                <SectionHeader title="Simulateur" icon="sliders" />
                <View style={styles.modeSelector}>
                    {[
                        { id: 'equity', label: 'Action', icon: 'trending-up' },
                        { id: 'tax', label: 'Défisc.', icon: 'pie-chart' },
                        { id: 'bond', label: 'Oblig.', icon: 'shield' }
                    ].map((m) => (
                        <TouchableOpacity key={m.id} onPress={() => setInvestMode(m.id as any)}
                            style={[styles.modeBtn, investMode === m.id && styles.modeBtnActive]}>
                            <Feather name={m.icon as any} size={14} color={investMode === m.id ? 'white' : '#6B7280'} style={{ marginRight: 6 }} />
                            <Text style={[styles.modeLabel, investMode === m.id && { color: 'white' }]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setInvestAmount(p => Math.max(1000, p - 1000))} style={styles.plusMinus}><Feather name="minus" size={20} color={THEME_COLOR} /></TouchableOpacity>
                    <Text style={styles.investBigAmount}>{investAmount.toLocaleString()} €</Text>
                    <TouchableOpacity onPress={() => setInvestAmount(p => p + 1000)} style={styles.plusMinus}><Feather name="plus" size={20} color={THEME_COLOR} /></TouchableOpacity>
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
            <SectionHeader title="Board & Management" icon="users" />
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

            <SectionHeader title="Data Room" icon="folder" />
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
            {/* Risk Card (Ajouté) */}
            <View style={styles.riskCard}>
                <Feather name="alert-triangle" size={20} color="#D97706" />
                <Text style={styles.riskText}>L'investissement comporte des risques (illiquidité, perte en capital). N'investissez que ce que vous pouvez perdre. <Text style={{ textDecorationLine: 'underline' }}>En savoir plus.</Text></Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            {/* 1. HEADER AVEC IMAGE DE FOND */}
            <View style={styles.headerAbsolute}>
                <Animated.Image
                    source={{ uri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80" }}
                    style={[styles.headerImage, { transform: [{ translateY: headerTranslateY }] }]}
                />
                <LinearGradient colors={['rgba(88, 28, 135, 0.4)', 'rgba(46, 16, 101, 0.85)', BG_COLOR]} style={styles.gradientOverlay} locations={[0, 0.6, 1]} />

                <Animated.View style={[styles.heroContent, { opacity: headerOpacity }]}>
                    <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}><View style={styles.dot} /><Text style={styles.statusText}>{PROJECT_DATA.status}</Text></View>
                        <View style={styles.sectorBadge}><Text style={styles.sectorText}>{PROJECT_DATA.sector}</Text></View>
                    </View>
                    <Text style={styles.projectTitle}>{PROJECT_DATA.name}</Text>
                    <Text style={styles.projectLoc}><Feather name="map-pin" size={14} /> {PROJECT_DATA.location}</Text>

                    <View style={styles.progressCard}>
                        <View style={styles.progressStats}>
                            <Text style={styles.raisedTxt}>{(PROJECT_DATA.raised / 1000000).toFixed(1)}M€ <Text style={styles.targetTxt}>/ {(PROJECT_DATA.target / 1000000).toFixed(0)}M€</Text></Text>
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
                {/* TABS */}
                <View style={styles.tabsContainer}>
                    {[
                        { id: 'vision', label: 'Vision' },
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
                    {activeTab === 'vision' && renderVisionTab()}
                    {activeTab === 'finance' && renderFinanceTab()}
                    {activeTab === 'docs' && renderDocsTab()}
                </View>
            </Animated.ScrollView>

            {/* 4. FOOTER */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Mon investissement</Text>
                    <Text style={styles.footerVal}>{investAmount.toLocaleString()} € <Text style={styles.footerMode}>({investMode === 'equity' ? 'Actions' : investMode === 'bond' ? 'Obligations' : 'Défisc.'})</Text></Text>
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
    projectLoc: { fontSize: 14, color: '#E9D5FF', marginBottom: 20 },

    progressCard: { backgroundColor: 'rgba(17, 24, 39, 0.7)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
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
    tabTxtActive: { color: THEME_COLOR, fontWeight: '700' },
    tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: THEME_COLOR, borderRadius: 2 },

    mainBody: { padding: 20, minHeight: 600, backgroundColor: BG_COLOR },
    tabContent: { gap: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, ...shadows.sm },

    // VISION
    videoContainer: { height: 200, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#4C1D95' },
    videoThumb: { width: '100%', height: '100%', opacity: 0.8 },
    playBtn: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' },
    liveBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: THEME_COLOR, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
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
    addressText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },

    // FINANCE
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    kpiBox: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, ...shadows.sm, borderTopWidth: 4, borderTopColor: THEME_COLOR },
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

    simBox: { backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', ...shadows.md },
    modeSelector: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 4, borderRadius: 12, marginBottom: 20 },
    modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
    modeBtnActive: { backgroundColor: THEME_COLOR },
    modeLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    plusMinus: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C4B5FD' },
    investBigAmount: { fontSize: 24, fontWeight: '800', color: THEME_COLOR },
    simResult: { backgroundColor: '#F5F3FF', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    simResLabel: { fontSize: 12, color: '#6B7280' },
    simResVal: { fontSize: 18, fontWeight: '700', color: THEME_COLOR },
    simResSub: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: 2 },
    badgeSim: { backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-end' },
    badgeSimText: { fontSize: 10, color: '#4B5563', fontWeight: '600' },

    // TEAM & DOCS (C'est ce bloc qui manquait)
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    
    teamCard: { width: 140, backgroundColor: 'white', padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', ...shadows.sm, borderWidth: 1, borderColor: '#F3F4F6' },
    teamAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: '#E2E8F0' },
    teamName: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center' },
    teamRole: { fontSize: 11, fontWeight: '700', color: THEME_COLOR, marginBottom: 4 },

    docList: { gap: 10 },
    docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F3F4F6', ...shadows.sm },
    docIcon: { width: 36, height: 36, backgroundColor: '#F5F3FF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
    docMeta: { fontSize: 12, color: '#6B7280' },
    riskCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF7ED', padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#FED7AA' },
    riskText: { flex: 1, fontSize: 12, color: '#9A3412', lineHeight: 18 },

    // FOOTER
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', ...shadows.lg },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: '#6B7280' },
    footerVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
    footerMode: { fontSize: 14, fontWeight: '400', color: '#9CA3AF' },
    ctaBtn: { backgroundColor: THEME_COLOR, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, ...shadows.glow },
    ctaTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Projet4;