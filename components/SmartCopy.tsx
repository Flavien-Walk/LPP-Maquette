import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, shadows, spacing } from "../styles/indexStyles";

// ============ CONFIGURATION ============
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Augmenté pour éviter que le texte soit coupé
const HEADER_MAX_HEIGHT = 140; 
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const IS_IOS = Platform.OS === 'ios';

// ============ TYPES & INTERFACES ============
interface Trader {
    id: string;
    name: string;
    tag: string;
    roi: number;
    riskScore: number;
    copiers: number;
    avatar: string;
    chartData: number[];
    description: string;
    topHoldings: { symbol: string; name: string; alloc: number }[];
    isPremium: boolean;
}

interface Signal {
    id: string;
    title: string;
    token: string;
    type: "buy" | "sell" | "info" | "warning";
    confidence: number;
    timeAgo: string;
}

// ============ MOCK DATA ============
const AI_INSIGHTS = {
    score: 87,
    trend: "Bullish",
    nextUpdate: "14 min",
    activeSignals: 12,
    topSector: "GreenTech",
};

const TRADERS_DATA: Trader[] = [
    {
        id: "1",
        name: "Sophie Martin",
        tag: "GreenTech Whale",
        roi: 42.5,
        riskScore: 3,
        copiers: 2840,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
        chartData: [20, 35, 30, 45, 60, 55, 70, 75, 82, 90],
        description: "Spécialiste des énergies renouvelables et de l'efficience énergétique. Approche long-terme.",
        topHoldings: [
            { symbol: "SLR", name: "SolarEdge", alloc: 35 },
            { symbol: "ENPH", name: "Enphase", alloc: 25 },
        ],
        isPremium: false,
    },
    {
        id: "2",
        name: "Marc Dubois",
        tag: "Aggressive Growth",
        roi: 84.2,
        riskScore: 8,
        copiers: 1560,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        chartData: [10, 20, 15, 40, 30, 80, 84, 60, 95, 110],
        description: "Recherche de pépites technologiques avant l'explosion.",
        topHoldings: [
            { symbol: "AI", name: "C3.ai", alloc: 40 },
            { symbol: "NVDA", name: "Nvidia", alloc: 30 },
        ],
        isPremium: true,
    },
    {
        id: "3",
        name: "Léa Zhang",
        tag: "Dividend King",
        roi: 12.8,
        riskScore: 2,
        copiers: 4200,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
        chartData: [5, 6, 7, 8, 9, 10, 11, 12, 12.5, 12.8],
        description: "Portefeuille défensif axé sur les dividendes.",
        topHoldings: [
            { symbol: "O", name: "Realty Inc", alloc: 30 },
            { symbol: "KO", name: "Coca-Cola", alloc: 25 },
        ],
        isPremium: false,
    },
];

const SIGNALS_DATA: Signal[] = [
    { id: "1", title: "Accumulation détectée", token: "SOLAR", type: "buy", confidence: 94, timeAgo: "2m" },
    { id: "2", title: "Rotation Sectorielle", token: "HEALTH", type: "info", confidence: 88, timeAgo: "15m" },
    { id: "3", title: "Sommet atteint", token: "TECH", type: "sell", confidence: 76, timeAgo: "1h" },
];

// ============ SUB-COMPONENTS ============

/**
 * Graphique minimaliste (Sparkline)
 */
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 60;
    const step = width / (data.length - 1);

    return (
        <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end' }}>
            {data.map((val, index) => {
                if (index === 0) return null;
                const barHeight = ((val - min) / range) * height;
                return (
                    <View
                        key={index}
                        style={{
                            width: step,
                            height: Math.max(barHeight, 2),
                            backgroundColor: color,
                            opacity: 0.8,
                            marginLeft: 1,
                            borderTopRightRadius: 2,
                            borderTopLeftRadius: 2
                        }}
                    />
                );
            })}
        </View>
    );
};

/**
 * Bouton FAB Intelligent (Menu + Overlay + Premium Locks)
 */
const SmartFab = () => {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const toValue = isOpen ? 0 : 1;
        
        Animated.spring(animation, {
            toValue,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
        }).start();
        
        setIsOpen(!isOpen);
    };

    const rotation = animation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "135deg"] });
    const scale = animation.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });
    const overlayOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    // Configuration des actions
    const actions = [
        { 
            icon: "cpu", 
            label: "Scan IA", 
            // Couleur grise pour indiquer inactif/premium
            color: "#64748B", 
            locked: true,
            subLabel: "Premium"
        },
        { 
            icon: "sliders", 
            label: "Filtres", 
            color: "#2563EB", 
            locked: false 
        },
        { 
            icon: "shield", 
            label: "Risque", 
            color: "#64748B", 
            locked: true,
            subLabel: "Premium"
        },
    ];

    return (
        <>
            {/* OVERLAY PLEIN ÉCRAN */}
            <TouchableWithoutFeedback onPress={toggle}>
                <Animated.View 
                    style={[
                        styles.fabOverlay,
                        { opacity: overlayOpacity },
                        !isOpen && { pointerEvents: 'none' } // Laisse passer les clics si fermé
                    ]} 
                >
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                </Animated.View>
            </TouchableWithoutFeedback>

            {/* CONTENEUR FAB */}
            <View style={styles.fabContainer} pointerEvents="box-none">
                
                {/* ACTIONS */}
                <View style={styles.fabActionsWrapper} pointerEvents={isOpen ? 'auto' : 'none'}>
                    {actions.map((action, i) => {
                        const translateY = animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (actions.length - i), 0]
                        });
                        const opacity = animation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0, 1]
                        });

                        return (
                            <Animated.View 
                                key={i} 
                                style={[
                                    styles.fabActionRow, 
                                    { opacity, transform: [{ translateY }] }
                                ]}
                            >
                                <View style={styles.fabLabel}>
                                    <Text style={[
                                        styles.fabLabelText, 
                                        action.locked && { color: colors.textSecondary }
                                    ]}>{action.label}</Text>
                                    {action.locked && (
                                        <Text style={styles.fabLabelSub}>PRO</Text>
                                    )}
                                </View>

                                <TouchableOpacity 
                                    style={[
                                        styles.fabMiniBtn, 
                                        { backgroundColor: action.color },
                                        action.locked && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }
                                    ]} 
                                    onPress={() => { 
                                        if(action.locked) {
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                        } else {
                                            toggle(); 
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {action.locked ? (
                                        <Feather name="lock" size={18} color="rgba(255,255,255,0.8)" />
                                    ) : (
                                        <Feather name={action.icon as any} size={20} color="white" />
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* BOUTON PRINCIPAL (+) */}
                <TouchableWithoutFeedback onPress={toggle}>
                    <Animated.View style={[styles.fabMainBtnShadow, { transform: [{ scale }] }]}>
                        <LinearGradient
                            colors={[colors.primary, colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.fabMainBtn}
                        >
                            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                                <Feather name="plus" size={32} color="white" />
                            </Animated.View>
                        </LinearGradient>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </>
    );
};

// ============ MAIN SCREEN ============
export default function SmartCopy() {
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);

    // Animations Header
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });
    
    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [60, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const heroOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Scroll Listener
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event: any) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                setShowScrollTop(offsetY > 300);
            }
        }
    );

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        Haptics.selectionAsync();
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* HEADER */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                {IS_IOS && (
                    <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
                )}
                {!IS_IOS && <View style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(255,255,255,0.96)'}]} />}
                
                <SafeAreaView style={styles.headerSafeArea}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            style={styles.iconBtn}
                        >
                            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        
                        <Animated.Text style={[styles.headerTitleSticky, { opacity: headerTitleOpacity }]}>
                            Smart Copy™
                        </Animated.Text>

                        <TouchableOpacity style={styles.iconBtn}>
                            <Feather name="settings" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={[styles.heroContainer, { opacity: heroOpacity }]}>
                        {/* Augmenter le padding top ou margin pour éviter le cutoff */}
                        <Text style={styles.heroTitle}>Smart Copy<Text style={{color: colors.primary}}>™</Text></Text>
                        <Text style={styles.heroSubtitle}>L'IA au service de votre portefeuille.</Text>
                    </Animated.View>
                </SafeAreaView>
                
                <Animated.View style={[styles.headerBorder, { opacity: headerTitleOpacity }]} />
            </Animated.View>

            {/* SCROLL CONTENT */}
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                        progressViewOffset={HEADER_MAX_HEIGHT}
                    />
                }
            >
                {/* Spacer pour le Header */}
                <View style={{ height: HEADER_MAX_HEIGHT }} />

                {/* HUD */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#1E293B', '#0F172A']}
                        start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                        style={styles.hudCard}
                    >
                        <View style={styles.hudTopRow}>
                            <View>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                                    <Feather name="cpu" size={14} color={colors.accent} />
                                    <Text style={styles.hudLabel}>Sentiment IA</Text>
                                </View>
                                <View style={styles.hudScoreContainer}>
                                    <Text style={styles.hudScore}>{AI_INSIGHTS.score}</Text>
                                    <Text style={styles.hudScoreTotal}>/100</Text>
                                    <View style={[styles.pill, {backgroundColor: colors.success}]}>
                                        <Text style={styles.pillText}>{AI_INSIGHTS.trend}</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.gaugeContainer}>
                                <View style={[styles.gaugeFill, {height: `${AI_INSIGHTS.score}%`}]} />
                            </View>
                        </View>

                        <View style={styles.hudDivider} />

                        <View style={styles.hudMetrics}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>{AI_INSIGHTS.activeSignals}</Text>
                                <Text style={styles.metricLabel}>Signaux Actifs</Text>
                            </View>
                            <View style={styles.metricSeparator} />
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>{AI_INSIGHTS.topSector}</Text>
                                <Text style={styles.metricLabel}>Top Secteur</Text>
                            </View>
                            <View style={styles.metricSeparator} />
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>{AI_INSIGHTS.nextUpdate}</Text>
                                <Text style={styles.metricLabel}>Mise à jour</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* TRADERS - WORDING CORRIGÉ */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Investisseurs</Text>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.horizontalScrollContent}
                    >
                        {TRADERS_DATA.map((trader) => (
                            <TouchableOpacity 
                                key={trader.id}
                                activeOpacity={0.9} 
                                style={styles.traderCard} 
                                onPress={() => {
                                    setSelectedTrader(trader);
                                    Haptics.selectionAsync();
                                }}
                            >
                                <View style={styles.traderHeader}>
                                    <Image source={{ uri: trader.avatar }} style={styles.traderAvatar} />
                                    <View style={styles.traderInfo}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={styles.traderName}>{trader.name}</Text>
                                            {trader.isPremium && <Feather name="star" size={12} color="#F59E0B" style={{marginLeft: 4}} />}
                                        </View>
                                        <Text style={styles.traderTag}>{trader.tag}</Text>
                                    </View>
                                    <View style={[
                                        styles.traderBadge, 
                                        { backgroundColor: trader.riskScore > 5 ? '#FEF2F2' : '#ECFDF5' }
                                    ]}>
                                        <Text style={[
                                            styles.traderRank,
                                            { color: trader.riskScore > 5 ? colors.danger : colors.success }
                                        ]}>Risk: {trader.riskScore}/10</Text>
                                    </View>
                                </View>

                                <View style={styles.traderStats}>
                                    <View>
                                        <Text style={styles.statLabel}>Profit (6m)</Text>
                                        <Text style={[styles.statValue, { color: trader.roi >= 0 ? colors.success : colors.danger }]}>
                                            {trader.roi > 0 ? '+' : ''}{trader.roi}%
                                        </Text>
                                    </View>
                                    <View style={styles.chartWrapper}>
                                        <Sparkline 
                                            data={trader.chartData} 
                                            color={trader.roi >= 0 ? colors.success : colors.danger} 
                                        />
                                    </View>
                                </View>

                                <View style={styles.traderFooter}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Feather name="users" size={14} color={colors.textTertiary} />
                                        <Text style={styles.copiersText}>{trader.copiers} copieurs</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.copyBtn} 
                                        onPress={(e) => { 
                                            e.stopPropagation(); 
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                        }}
                                    >
                                        <Text style={styles.copyBtnText}>Copier</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                        
                        {/* Locked Card */}
                        <TouchableOpacity style={styles.lockedCard} activeOpacity={0.8}>
                            <View style={styles.lockedIconBg}>
                                <Feather name="lock" size={24} color={colors.textTertiary} />
                            </View>
                            <Text style={styles.lockedText}>+24 Pro Traders</Text>
                            <View style={styles.premiumBadge}>
                                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* SIGNAUX */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                            <Text style={styles.sectionTitle}>Signaux Live</Text>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.signalsList}>
                        {SIGNALS_DATA.map((signal) => (
                            <TouchableOpacity key={signal.id} activeOpacity={0.7} style={styles.signalRow}>
                                <View style={[
                                    styles.signalIconContainer, 
                                    signal.type === 'buy' ? { backgroundColor: colors.successLight } : 
                                    signal.type === 'sell' ? { backgroundColor: colors.dangerLight } : 
                                    { backgroundColor: colors.primaryLight }
                                ]}>
                                    <Feather 
                                        name={signal.type === 'buy' ? "trending-up" : signal.type === 'sell' ? "trending-down" : "info"} 
                                        size={20} 
                                        color={signal.type === 'buy' ? colors.success : signal.type === 'sell' ? colors.danger : colors.primary} 
                                    />
                                </View>
                                <View style={styles.signalContent}>
                                    <View style={styles.signalHeader}>
                                        <Text style={styles.signalTitle}>{signal.title}</Text>
                                        <Text style={styles.signalTime}>{signal.timeAgo}</Text>
                                    </View>
                                    <View style={styles.signalFooter}>
                                        <Text style={styles.signalToken}>{signal.token}</Text>
                                        <Text style={styles.signalDot}>•</Text>
                                        <Text style={[
                                            styles.signalConfidence,
                                            { color: signal.confidence > 80 ? colors.success : colors.warning }
                                        ]}>Confiance {signal.confidence}%</Text>
                                    </View>
                                </View>
                                <Feather name="chevron-right" size={20} color={colors.neutral300} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* BANNIÈRE PROMO */}
                <View style={[styles.section, { paddingBottom: 100 }]}>
                    <TouchableOpacity activeOpacity={0.9}>
                        <LinearGradient 
                            colors={[colors.accent, colors.primary]} 
                            start={{x:0, y:0}} end={{x:1, y:1}} 
                            style={styles.promoBanner}
                        >
                            <View style={styles.promoContent}>
                                <Text style={styles.promoTitle}>Passez au niveau Pro</Text>
                                <Text style={styles.promoDesc}>Copies illimitées, analyse de risque avancée et signaux prioritaires.</Text>
                                <View style={styles.promoBtn}>
                                    <Text style={styles.promoBtnText}>Essai Gratuit 7j</Text>
                                </View>
                            </View>
                            <Feather 
                                name="shield" 
                                size={80} 
                                color="rgba(255,255,255,0.15)" 
                                style={styles.promoIconBg} 
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* BUTTONS FLOTTANTS CORRIGÉS */}
            {showScrollTop && (
                <TouchableOpacity 
                    onPress={scrollToTop} 
                    style={styles.scrollTopBtn}
                    activeOpacity={0.8}
                >
                    <BlurView intensity={80} tint="light" style={styles.scrollTopBlur}>
                        <Feather name="arrow-up" size={24} color={colors.primary} />
                    </BlurView>
                </TouchableOpacity>
            )}
            
            <SmartFab />

            {/* MODALE SIMPLE */}
            <Modal
                visible={!!selectedTrader}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedTrader(null)}
            >
                {selectedTrader && (
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Détails</Text>
                            <TouchableOpacity onPress={() => setSelectedTrader(null)} style={styles.closeBtn}>
                                <Feather name="x" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{padding: 20}}>
                            <Image source={{uri: selectedTrader.avatar}} style={{width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 16}} />
                            <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: colors.textPrimary}}>{selectedTrader.name}</Text>
                            <Text style={{fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24}}>{selectedTrader.tag}</Text>
                            
                            <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 8}}>Description</Text>
                            <Text style={{fontSize: 16, color: colors.textSecondary, lineHeight: 24, marginBottom: 24}}>{selectedTrader.description}</Text>

                            <TouchableOpacity 
                                style={[styles.copyBtn, {width: '100%', marginTop: 20, paddingVertical: 16}]}
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    setSelectedTrader(null);
                                }}
                            >
                                <Text style={[styles.copyBtnText, {fontSize: 16}]}>Copier ce portefeuille</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
}

// ============ STYLES ============
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    
    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        overflow: 'hidden',
    },
    headerSafeArea: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        height: 50,
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerTitleSticky: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.textPrimary,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: -1,
    },
    headerBorder: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: colors.borderLight,
    },
    heroContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: 8, 
        justifyContent: 'center'
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
        lineHeight: 40,
    },
    heroSubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        marginTop: 4,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: spacing.section,
    },

    // HUD
    hudCard: {
        marginHorizontal: spacing.lg,
        borderRadius: radius.xl,
        padding: spacing.lg,
        ...shadows.lg,
        marginTop: spacing.md,
    },
    hudTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    hudLabel: {
        color: colors.textTertiary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    hudScoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    hudScore: {
        color: colors.white,
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    hudScoreTotal: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 2,
    },
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
        alignSelf: 'center',
    },
    pillText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    gaugeContainer: {
        width: 6,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    gaugeFill: {
        width: '100%',
        backgroundColor: colors.success,
        borderRadius: 3,
    },
    hudDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: spacing.md,
    },
    hudMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        alignItems: 'center',
        flex: 1,
    },
    metricValue: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
    metricLabel: {
        color: colors.textTertiary,
        fontSize: 11,
        marginTop: 2,
    },
    metricSeparator: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
    },

    // Sections Commons
    section: {
        marginTop: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    linkText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },

    // Traders Horizontal Scroll
    horizontalScrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 20, 
    },
    traderCard: {
        width: 220,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.md,
        marginRight: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    traderHeader: {
        marginBottom: spacing.md,
    },
    traderAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: spacing.sm,
    },
    traderInfo: {
        marginBottom: spacing.xs,
    },
    traderName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    traderTag: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    traderBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    traderRank: {
        fontSize: 10,
        fontWeight: '700',
    },
    traderStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: spacing.md,
    },
    statLabel: {
        fontSize: 11,
        color: colors.textTertiary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    chartWrapper: {
        paddingBottom: 4,
    },
    traderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingTop: spacing.sm,
    },
    copiersText: {
        fontSize: 11,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    copyBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.md,
    },
    copyBtnText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    
    // Locked Card
    lockedCard: {
        width: 160,
        backgroundColor: colors.neutral100,
        borderRadius: radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    lockedIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    lockedText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    premiumBadge: {
        backgroundColor: colors.neutral900,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    premiumBadgeText: {
        color: '#FBBF24',
        fontSize: 10,
        fontWeight: '800',
    },

    // Signals List
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.danger,
        marginRight: 6,
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.danger,
    },
    signalsList: {
        paddingHorizontal: spacing.lg,
    },
    signalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.xs,
    },
    signalIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    signalContent: {
        flex: 1,
    },
    signalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    signalTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    signalTime: {
        fontSize: 11,
        color: colors.textTertiary,
    },
    signalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signalToken: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    signalDot: {
        fontSize: 12,
        color: colors.textTertiary,
        marginHorizontal: 6,
    },
    signalConfidence: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Promo Banner
    promoBanner: {
        marginHorizontal: spacing.lg,
        borderRadius: radius.xl,
        padding: spacing.xl,
        overflow: 'hidden',
        minHeight: 140,
        ...shadows.md,
    },
    promoContent: {
        flex: 1,
        zIndex: 1,
    },
    promoTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 4,
    },
    promoDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
        lineHeight: 20,
        maxWidth: '80%',
    },
    promoBtn: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radius.lg,
        alignSelf: 'flex-start',
        ...shadows.sm,
    },
    promoBtnText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 13,
    },
    promoIconBg: {
        position: 'absolute',
        right: -10,
        bottom: -20,
        transform: [{ rotate: '-15deg' }],
    },

    // Scroll Top Btn
    scrollTopBtn: {
        position: 'absolute',
        bottom: 110, // Au-dessus du FAB (30 + 64 + marge)
        right: 20,   // À droite
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        zIndex: 900,
        ...shadows.lg,
        backgroundColor: 'white',
    },
    scrollTopBlur: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // FAB & Overlay
    fabOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)', // Gris/Noir semi-transparent
        zIndex: 998,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 999,
    },
    fabActionsWrapper: {
        marginBottom: 16,
        alignItems: 'flex-end',
        marginRight: 8,
    },
    fabActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'flex-end',
    },
    fabLabel: {
        backgroundColor: colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 12,
        ...shadows.sm,
        alignItems: 'flex-end'
    },
    fabLabelText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    fabLabelSub: {
        fontSize: 10,
        fontWeight: '800',
        color: '#F59E0B', // Gold/Warning
    },
    fabMiniBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    fabMainBtnShadow: {
        ...shadows.glow,
        borderRadius: 32,
        backgroundColor: colors.primary,
    },
    fabMainBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
        top: 14,
        padding: 4,
    },
});