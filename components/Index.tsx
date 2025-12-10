// components/Index.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground, // ✅ AJOUT DE L'IMPORT MANQUANT
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, styles as globalStyles, spacing } from "../styles/indexStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES ============
type ActiveTab = "feed" | "invest" | "live" | "map" | "mail";
type GeoFilter = "local" | "france" | "world";
type IconSize = "sm" | "md" | "lg" | "xl";
type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" | "accent";
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "success";
type ButtonSize = "sm" | "md" | "lg";
type CardVariant = "default" | "elevated" | "outlined" | "glass" | "dark";

interface Post {
  id: string;
  type: "startup" | "investor";
  author: string;
  avatarUrl: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  verified: boolean;
  liked: boolean;
}

interface PortfolioItem {
  id: string;
  projectName: string;
  imageUrl: string;
  shares: number;
  variation: number;
  value: number;
  sector: string;
}

interface LiveEvent {
  id: string;
  title: string;
  startup: string;
  startupAvatar: string;
  datetime: string;
  interested: number;
  sector: string;
  isLive: boolean;
  viewers?: number;
  imageUrl: string;
}

interface Replay {
  id: string;
  title: string;
  startup: string;
  duration: string;
  views: number;
  location: string;
  thumbnailUrl: string;
}

interface MailItem {
  id: string;
  type: "rapport" | "notification" | "message";
  project: string;
  subject: string;
  date: string;
  read: boolean;
}

interface Project {
  id: string;
  name: string;
  city: string;
  tags: string[];
  raised: number;
  goal: number;
  region: GeoFilter;
  imageUrl: string;
  investors: number;
  daysLeft: number;
  investorAvatars: string[];
}

interface Story {
  id: string;
  name: string;
  avatarUrl: string;
  hasNew: boolean;
  viewed: boolean;
}

interface TrendingItem {
  id: string;
  name: string;
  sector: string;
  change: number;
  imageUrl: string;
}

// ============ STYLE MAPPINGS ============
const iconSizeStyles: Record<IconSize, TextStyle> = {
  sm: globalStyles.iconSM,
  md: globalStyles.iconMD,
  lg: globalStyles.iconLG,
  xl: globalStyles.iconXL,
};

const avatarSizeStyles: Record<IconSize, ViewStyle> = {
  sm: globalStyles.avatarSM,
  md: globalStyles.avatarMD,
  lg: globalStyles.avatarLG,
  xl: globalStyles.avatarXL,
};

const avatarTextSizeStyles: Record<IconSize, TextStyle> = {
  sm: globalStyles.avatarTextSM,
  md: globalStyles.avatarTextMD,
  lg: globalStyles.avatarTextLG,
  xl: globalStyles.avatarTextLG,
};

const badgeVariantStyles: Record<BadgeVariant, ViewStyle> = {
  primary: globalStyles.badgePrimary,
  secondary: globalStyles.badgeSecondary,
  success: globalStyles.badgeSuccess,
  warning: globalStyles.badgeWarning,
  danger: globalStyles.badgeDanger,
  neutral: globalStyles.badgeNeutral,
  accent: globalStyles.badgeAccent,
};

const badgeTextVariantStyles: Record<BadgeVariant, TextStyle> = {
  primary: globalStyles.badgeTextPrimary,
  secondary: globalStyles.badgeTextSecondary,
  success: globalStyles.badgeTextSuccess,
  warning: globalStyles.badgeTextWarning,
  danger: globalStyles.badgeTextDanger,
  neutral: globalStyles.badgeTextNeutral,
  accent: globalStyles.badgeTextAccent,
};

const buttonVariantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: globalStyles.buttonPrimary,
  secondary: globalStyles.buttonSecondary,
  outline: globalStyles.buttonOutline,
  ghost: globalStyles.buttonGhost,
  accent: globalStyles.buttonAccent,
  success: globalStyles.buttonSuccess,
};

const buttonSizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: globalStyles.buttonSM,
  md: globalStyles.buttonMD,
  lg: globalStyles.buttonLG,
};

const buttonTextVariantStyles: Record<ButtonVariant, TextStyle> = {
  primary: globalStyles.buttonTextPrimary,
  secondary: globalStyles.buttonTextSecondary,
  outline: globalStyles.buttonTextOutline,
  ghost: globalStyles.buttonTextGhost,
  accent: globalStyles.buttonTextAccent,
  success: globalStyles.buttonTextSuccess,
};

const buttonTextSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: globalStyles.buttonTextSM,
  md: globalStyles.buttonTextMD,
  lg: globalStyles.buttonTextLG,
};

const cardVariantStyles: Record<CardVariant, ViewStyle> = {
  default: globalStyles.cardDefault,
  elevated: globalStyles.cardElevated,
  outlined: globalStyles.cardOutlined,
  glass: globalStyles.cardGlass,
  dark: globalStyles.cardDark,
};

// ============ IMAGE URLS (Unsplash) ============
const IMAGES = {
  avatars: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", // 0: Sophie (GreenTech)
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", // 1: Marc (MedIA)
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", // 2: Lea (ImmoVest)
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", // 3: Thomas (FinFlow)
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", // 4: Claire (BioFood)
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", // 5: Marie Dupont (Nouveau visage)
  ],
  startups: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", // 0: GreenTech Lyon
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop", // 1: MedIA
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", // 2: ImmoVest
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop", // 3: FinFlow
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop", // 4: BioFood
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop", // 5: VirtualEst
  ],
  projects: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop", // GreenTech
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop", // Food/Bio
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop", // Immo
  ],
  posts: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop", // Panneaux solaires
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop", // Labo médical
  ],
  lives: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop", 
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&h=300&fit=crop",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&h=300&fit=crop",
  ],
  replays: [
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop",
  ],
  map: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=500&fit=crop",
};

// ============ MOCK DATA ============
const MOCK_STORIES: Story[] = [
  { 
    id: "1", 
    name: "GreenTech Lyon", 
    avatarUrl: IMAGES.startups[0], 
    hasNew: true, 
    viewed: false 
  },
  { 
    id: "2", 
    name: "MedIA", 
    avatarUrl: IMAGES.startups[1], 
    hasNew: true, 
    viewed: false 
  },
  { 
    id: "3", 
    name: "Virtual Estate", 
    avatarUrl: IMAGES.startups[2], 
    hasNew: true, 
    viewed: true 
  },
  { 
    id: "4", 
    name: "FinFlow", 
    avatarUrl: IMAGES.startups[3], 
    hasNew: false, 
    viewed: true 
  },
  { 
    id: "5", 
    name: "BioFood", 
    avatarUrl: IMAGES.startups[4], 
    hasNew: false, 
    viewed: true 
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    type: "startup",
    author: "GreenTech Lyon",
    avatarUrl: IMAGES.startups[0],
    content: "Nous venons d'atteindre 150% de notre objectif de levée. Un immense merci à tous nos investisseurs qui nous font confiance depuis le premier jour.",
    imageUrl: IMAGES.posts[0],
    likes: 234,
    comments: 45,
    shares: 12,
    timestamp: "Il y a 2h",
    verified: true,
    liked: false,
  },
  {
    id: "2",
    type: "investor",
    author: "Marie Dupont",
    avatarUrl: IMAGES.avatars[5],
    content: "Premier investissement sur LPP dans une startup food-tech marseillaise. Le pitch était convaincant et l'équipe solide. Hâte de suivre leur évolution !",
    likes: 89,
    comments: 12,
    shares: 3,
    timestamp: "Il y a 4h",
    verified: false,
    liked: true,
  },
  {
    id: "3",
    type: "startup",
    author: "MedIA Diagnostics",
    avatarUrl: IMAGES.startups[1],
    content: "LIVE demain à 18h : présentation exclusive de notre solution IA pour le diagnostic médical. Inscrivez-vous pour ne pas manquer cette session Q&A avec notre équipe R&D.",
    imageUrl: IMAGES.posts[1],
    likes: 156,
    comments: 28,
    shares: 8,
    timestamp: "Il y a 6h",
    verified: true,
    liked: false,
  },
];

const MOCK_PORTFOLIO: PortfolioItem[] = [
  { id: "1", projectName: "GreenTech Lyon", imageUrl: IMAGES.startups[0], shares: 50, variation: 12.5, value: 2250, sector: "CleanTech" },
  { id: "2", projectName: "FoodLab Marseille", imageUrl: IMAGES.startups[4], shares: 30, variation: -3.2, value: 870, sector: "FoodTech" },
  { id: "3", projectName: "ImmoVest Nantes", imageUrl: IMAGES.startups[2], shares: 100, variation: 8.7, value: 3480, sector: "PropTech" },
];

const MOCK_LIVES: LiveEvent[] = [
  {
    id: "1",
    title: "Pitch Live : Virtual Estate",
    startup: "Marseille, PACA",
    startupAvatar: IMAGES.avatars[3],
    datetime: "En direct",
    interested: 342,
    sector: "PropTech/ Web3",
    isLive: true,
    viewers: 1247,
    imageUrl: IMAGES.lives[0],
  },
  {
    id: "2",
    title: "Q&A Investisseurs - Bilan S1 2024",
    startup: "FinFlow Systems",
    startupAvatar: IMAGES.startups[3],
    datetime: "Demain, 14h30",
    interested: 189,
    sector: "FinTech",
    isLive: false,
    imageUrl: IMAGES.lives[1],
  },
  {
    id: "3",
    title: "Demo Produit : IA Diagnostic",
    startup: "MedIA Diagnostics",
    startupAvatar: IMAGES.startups[1],
    datetime: "Ven. 20h00",
    interested: 276,
    sector: "HealthTech",
    isLive: false,
    imageUrl: IMAGES.lives[2],
  },
];

const MOCK_REPLAYS: Replay[] = [
  { id: "1", title: "Comment lever 500K€ en 48h", startup: "SpeedFund Lyon", duration: "45:22", views: 2340, location: "Lyon", thumbnailUrl: IMAGES.replays[0] },
  { id: "2", title: "Masterclass Valorisation", startup: "Incubateur HEC", duration: "1:20:15", views: 5621, location: "Paris", thumbnailUrl: IMAGES.replays[1] },
  { id: "3", title: "Retour d'XP : Notre pivot", startup: "PivotLab Lille", duration: "32:48", views: 1890, location: "Lille", thumbnailUrl: IMAGES.replays[2] },
];

const MOCK_MAILS: MailItem[] = [
  { id: "1", type: "rapport", project: "GreenTech Lyon", subject: "Rapport trimestriel T2 2024", date: "Il y a 2j", read: false },
  { id: "2", type: "notification", project: "FoodLab Marseille", subject: "Objectif de levée atteint !", date: "Il y a 3j", read: false },
  { id: "3", type: "message", project: "ImmoVest Nantes", subject: "Invitation événement investisseurs", date: "Il y a 5j", read: true },
  { id: "4", type: "rapport", project: "MedIA Diagnostics", subject: "Rapport trimestriel T2 2024", date: "Il y a 1 sem", read: true },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "GreenTech Lyon",
    city: "Lyon",
    tags: ["CleanTech", "B2B", "Impact"],
    raised: 320000,
    goal: 400000,
    region: "france",
    imageUrl: IMAGES.projects[0],
    investors: 127,
    daysLeft: 12,
    investorAvatars: [IMAGES.avatars[0], IMAGES.avatars[1], IMAGES.avatars[2]],
  },
  {
    id: "2",
    name: "FoodLab Marseille",
    city: "Marseille",
    tags: ["FoodTech", "B2C"],
    raised: 85000,
    goal: 150000,
    region: "local",
    imageUrl: IMAGES.projects[1],
    investors: 54,
    daysLeft: 28,
    investorAvatars: [IMAGES.avatars[3], IMAGES.avatars[4]],
  },
  {
    id: "3",
    name: "TechBerlin",
    city: "Berlin",
    tags: ["SaaS", "B2B"],
    raised: 450000,
    goal: 600000,
    region: "world",
    imageUrl: IMAGES.projects[2],
    investors: 203,
    daysLeft: 5,
    investorAvatars: [IMAGES.avatars[1], IMAGES.avatars[2], IMAGES.avatars[4]],
  },
];

const MOCK_TRENDING: TrendingItem[] = [
  { id: "1", name: "GreenTech Lyon", sector: "CleanTech", change: 24.5, imageUrl: IMAGES.startups[0] },
  { id: "2", name: "MedIA Diagnostics", sector: "HealthTech", change: 18.2, imageUrl: IMAGES.startups[1] },
  { id: "3", name: "FinFlow Systems", sector: "FinTech", change: 12.8, imageUrl: IMAGES.startups[3] },
];

// ============ SUB-COMPONENTS ============

const Icon: React.FC<{ name: string; size?: IconSize; color?: string }> = ({ name, size = "md", color }) => {
  const iconMap: Record<string, string> = {
    heart: "heart",
    "heart-outline": "heart",
    comment: "message-circle",
    share: "share-2",
    plus: "plus",
    check: "check",
    arrow: "arrow-right",
    "arrow-left": "arrow-left",
    "arrow-up": "arrow-up",
    "arrow-right": "arrow-right",
    calendar: "calendar",
    users: "users",
    clock: "clock",
    eye: "eye",
    location: "map-pin",
    mail: "mail",
    chart: "bar-chart-2",
    bell: "bell",
    play: "play-circle",
    live: "radio",
    star: "star",
    "star-outline": "star",
    menu: "menu",
    search: "search",
    filter: "sliders",
    close: "x",
    edit: "edit-2",
    bookmark: "bookmark",
    settings: "settings",
    user: "user",
    briefcase: "briefcase",
    book: "book-open",
    map: "map",
    home: "home",
    trending: "trending-up",
    "trending-down": "trending-down",
    verified: "check-circle",
    more: "more-horizontal",
    notification: "bell",
    wallet: "briefcase",
    copy: "copy",
    external: "external-link",
    fire: "activity",
    sparkle: "zap",
    "trending-up": "trending-up",
    "file-text": "file-text",
    "plus-circle": "plus-circle",
  };

  const iconName = iconMap[name] || "circle";
  const numericSize = size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 32;

  return (
    <Feather 
      name={iconName} 
      size={numericSize} 
      color={color || colors.textSecondary} 
    />
  );
};

const Avatar: React.FC<{ 
  imageUrl?: string; 
  initials?: string; 
  size?: IconSize; 
  showOnline?: boolean; 
  style?: ViewStyle;
}> = ({ imageUrl, initials, size = "md", showOnline, style }) => (
  <View style={[globalStyles.avatar, avatarSizeStyles[size], style]}>
    {imageUrl ? (
      <Image source={{ uri: imageUrl }} style={globalStyles.avatarImage} />
    ) : (
      <View style={[globalStyles.avatar, globalStyles.avatarFallback, avatarSizeStyles[size]]}>
        <Text style={[globalStyles.avatarText, avatarTextSizeStyles[size]]}>{initials}</Text>
      </View>
    )}
    {showOnline && <View style={globalStyles.avatarOnline} />}
  </View>
);

const Badge: React.FC<{ label: string; variant?: BadgeVariant }> = ({ label, variant = "primary" }) => (
  <View style={[globalStyles.badge, badgeVariantStyles[variant]]}>
    <Text style={[globalStyles.badgeText, badgeTextVariantStyles[variant]]}>{label}</Text>
  </View>
);

const Button: React.FC<{
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  disabled?: boolean;
}> = ({ label, onPress, variant = "primary", size = "md", fullWidth = false, icon, iconPosition = "left", disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: fullWidth ? 1 : undefined }}>
      <TouchableOpacity
        style={[
          globalStyles.button,
          buttonVariantStyles[variant],
          buttonSizeStyles[size],
          fullWidth && globalStyles.buttonFullWidth,
          disabled && globalStyles.buttonDisabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled}
      >
        {icon && iconPosition === "left" && (
          <Icon 
            name={icon} 
            size="sm" 
            color={variant === "outline" || variant === "ghost" ? colors.textPrimary : colors.white} 
          />
        )}
        <Text style={[globalStyles.buttonText, buttonTextVariantStyles[variant], buttonTextSizeStyles[size]]}>
          {label}
        </Text>
        {icon && iconPosition === "right" && (
          <Icon 
            name={icon} 
            size="sm" 
            color={variant === "outline" || variant === "ghost" ? colors.textPrimary : colors.white} 
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Card: React.FC<{ 
  children: React.ReactNode; 
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
}> = ({ children, variant = "default", style, onPress }) => {
  const content = (
    <View style={[globalStyles.card, cardVariantStyles[variant], style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const GradientCard: React.FC<{
  children: React.ReactNode;
  colors: string[];
  style?: ViewStyle;
}> = ({ children, colors: gradientColors, style }) => (
  <LinearGradient
    colors={gradientColors as [string, string, ...string[]]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[globalStyles.card, globalStyles.cardGradient, style]}
  >
    {children}
  </LinearGradient>
);

const SectionHeader: React.FC<{ 
  title: string; 
  subtitle?: string;
  action?: string; 
  onAction?: () => void;
  compact?: boolean;
}> = ({ title, subtitle, action, onAction, compact }) => (
  <View style={[globalStyles.sectionHeader, compact && globalStyles.sectionHeaderCompact]}>
    <View>
      <Text style={globalStyles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={globalStyles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <TouchableOpacity onPress={onAction} style={globalStyles.sectionAction} activeOpacity={0.7}>
        <Text style={globalStyles.sectionActionText}>{action}</Text>
        <Icon name="arrow" size="sm" color={colors.textSecondary} />
      </TouchableOpacity>
    )}
  </View>
);

const Divider: React.FC<{ variant?: "default" | "light" | "section" }> = ({ variant = "default" }) => (
  <View style={[
    globalStyles.divider, 
    variant === "light" && globalStyles.dividerLight,
    variant === "section" && globalStyles.dividerSection,
  ]} />
);

const SegmentedControl: React.FC<{
  options: { key: string; label: string }[];
  selected: string;
  onChange: (key: string) => void;
}> = ({ options, selected, onChange }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const optionWidth = (SCREEN_WIDTH - spacing.lg * 2 - spacing.xs * 2) / options.length;

  useEffect(() => {
    const index = options.findIndex(o => o.key === selected);
    Animated.spring(translateX, {
      toValue: index * optionWidth,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  return (
    <View style={globalStyles.segmentedControl}>
      <Animated.View 
        style={[
          globalStyles.segmentedOptionActive,
          {
            position: "absolute",
            width: optionWidth,
            height: "100%",
            transform: [{ translateX }],
          }
        ]} 
      />
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={globalStyles.segmentedOption}
          onPress={() => onChange(option.key)}
          activeOpacity={0.7}
        >
          <Text style={[
            globalStyles.segmentedOptionText, 
            selected === option.key && globalStyles.segmentedOptionTextActive
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AnimatedCard: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  style?: ViewStyle;
}> = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

const StoryItem: React.FC<{ story: Story; index: number }> = ({ story, index }) => {
  const router = useRouter(); 
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animation tactile
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // ✅ LOGIQUE DE REDIRECTION MISE À JOUR
    if (story.name === "GreenTech Lyon") {
      router.push("/story1");
    } else if (story.name === "MedIA") {
      // 👉 Redirection vers la Story 2 (MedIA)
      router.push("/story2");
    } else {
      console.log("Ouvrir la story de :", story.name);
      // Pour les autres, pas de redirection pour l'instant
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[globalStyles.storyItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[
          globalStyles.storyRing,
          story.hasNew && !story.viewed ? globalStyles.storyRingActive : globalStyles.storyRingViewed
        ]}>
          <Image source={{ uri: story.avatarUrl }} style={globalStyles.storyAvatar} />
        </View>
        <Text 
          style={[globalStyles.storyLabel, story.hasNew && !story.viewed && globalStyles.storyLabelActive]}
          numberOfLines={1}
        >
          {story.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
  

const PostCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const heartScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const handleLike = () => {
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleImagePress = () => {
  };

  const handleAuthorPress = () => {
    // Redirection vers le profil de l'auteur
    if (post.author === "Marie Dupont") {
      router.push("/profil");
    } else if (post.author === "GreenTech Lyon") {
      router.push("/projet1");
    } else if (post.author === "MedIA Diagnostics") {
      router.push("/projet2");
    }
  };

  return (
    <AnimatedCard delay={index * 100}>
      <View style={globalStyles.postCard}>
        <View style={globalStyles.postHeader}>
          <TouchableOpacity 
            onPress={handleAuthorPress} 
            activeOpacity={0.7}
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
          >
            <Avatar imageUrl={post.avatarUrl} size="md" />
            <View style={globalStyles.postAuthorContainer}>
              <View style={globalStyles.postAuthorRow}>
                <Text style={globalStyles.postAuthor}>{post.author}</Text>
                {post.verified && (
                  <View style={globalStyles.postVerified}>
                    <Icon name="check" size="sm" color={colors.white} />
                  </View>
                )}
              </View>
              <Text style={globalStyles.postTimestamp}>{post.timestamp}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.postMoreButton}>
            <Icon name="more" size="md" color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={globalStyles.postContent}>{post.content}</Text>
        
        {post.imageUrl && (
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
            <Image source={{ uri: post.imageUrl }} style={globalStyles.postImage} resizeMode="cover" />
          </TouchableOpacity>
        )}

        <View style={globalStyles.postStats}>
          <View style={globalStyles.postStatItem}>
            <Icon name="heart" size="sm" color={colors.danger} />
            <Text style={globalStyles.postStatText}>{likesCount}</Text>
          </View>
          <View style={globalStyles.postStatItem}>
            <Text style={globalStyles.postStatText}>{post.comments} commentaires</Text>
          </View>
          <View style={globalStyles.postStatItem}>
            <Text style={globalStyles.postStatText}>{post.shares} partages</Text>
          </View>
        </View>

        <View style={globalStyles.postActions}>
          <TouchableOpacity 
            style={[globalStyles.postActionButton, liked && globalStyles.postActionButtonActive]}
            onPress={handleLike}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon name={liked ? "heart" : "heart-outline"} size="md" color={liked ? colors.danger : colors.textSecondary} />
            </Animated.View>
            <Text style={[globalStyles.postActionText, liked && globalStyles.postActionTextActive]}>J'aime</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={globalStyles.postActionButton}>
            <Icon name="comment" size="md" color={colors.textSecondary} />
            <Text style={globalStyles.postActionText}>Commenter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={globalStyles.postActionButton}>
            <Icon name="share" size="md" color={colors.textSecondary} />
            <Text style={globalStyles.postActionText}>Partager</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );
};

const PortfolioRow: React.FC<{ item: PortfolioItem; isLast: boolean }> = ({ item, isLast }) => (
  <View style={[globalStyles.portfolioRow, isLast && globalStyles.portfolioRowLast]}>
    <Image source={{ uri: item.imageUrl }} style={globalStyles.portfolioProjectImage} />
    <View style={globalStyles.portfolioProjectInfo}>
      <Text style={globalStyles.portfolioProjectName}>{item.projectName}</Text>
      <Text style={globalStyles.portfolioShares}>{item.shares} parts · {item.sector}</Text>
    </View>
    <View style={globalStyles.portfolioValues}>
      <Text style={globalStyles.portfolioValue}>{item.value.toLocaleString("fr-FR")} €</Text>
      <View style={[
        globalStyles.portfolioVariationContainer,
        item.variation >= 0 ? globalStyles.variationPositive : globalStyles.variationNegative,
      ]}>
        <Icon name={item.variation >= 0 ? "trending" : "trending-down"} size="sm" color={item.variation >= 0 ? colors.successDark : colors.dangerDark} />
        <Text style={[globalStyles.portfolioVariation, item.variation >= 0 ? globalStyles.textPositive : globalStyles.textNegative]}>
          {item.variation >= 0 ? "+" : ""}{item.variation.toFixed(1)}%
        </Text>
      </View>
    </View>
  </View>
);

const LiveCard: React.FC<{ live: LiveEvent }> = ({ live }) => {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (live.isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [live.isLive]);

  // ✅ FONCTION DE NAVIGATION SELON L'ID DU LIVE
  const handlePress = () => {
    switch (live.id) {
      case "1":
        router.push("/live"); // Pitch Live : Révolution AgriTech
        break;
      case "2":
        router.push("/live2"); // Q&A Investisseurs
        break;
      case "3":
        router.push("/live3"); // Demo Produit : IA Diagnostic
        break;
      default:
        router.push("/live");
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.9}
      style={globalStyles.liveCard}
    >
      <ImageBackground source={{ uri: live.imageUrl }} style={globalStyles.liveCardImage}>
        <View style={globalStyles.liveCardImageOverlay}>
          <View style={globalStyles.liveCardHeader}>
            {live.isLive ? (
              <Animated.View style={[globalStyles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
                <View style={globalStyles.liveDot} />
                <Text style={globalStyles.liveBadgeText}>LIVE</Text>
              </Animated.View>
            ) : (
              <Badge label="À venir" variant="neutral" />
            )}
            {live.isLive && live.viewers && (
              <View style={globalStyles.liveViewers}>
                <Icon name="eye" size="sm" color={colors.white} />
                <Text style={globalStyles.liveViewersText}>{live.viewers.toLocaleString()}</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
      <View style={globalStyles.liveCardContent}>
        <Text style={globalStyles.liveTitle} numberOfLines={2}>{live.title}</Text>
        <View style={globalStyles.liveStartupRow}>
          <Image source={{ uri: live.startupAvatar }} style={globalStyles.liveStartupAvatar} />
          <Text style={globalStyles.liveStartup}>{live.startup}</Text>
        </View>
        <View style={globalStyles.liveDetails}>
          <View style={globalStyles.liveDetailItem}>
            <Icon name="calendar" size="sm" color={colors.textTertiary} />
            <Text style={globalStyles.liveDetailText}>{live.datetime}</Text>
          </View>
          <View style={globalStyles.liveDetailItem}>
            <Icon name="users" size="sm" color={colors.textTertiary} />
            <Text style={globalStyles.liveDetailText}>{live.interested}</Text>
          </View>
        </View>
        <Button 
          label={live.isLive ? "Rejoindre" : "S'inscrire"} 
          variant={live.isLive ? "primary" : "outline"} 
          size="sm"
          fullWidth 
          onPress={handlePress}
        />
      </View>
    </TouchableOpacity>
  );
};

const ReplayCard: React.FC<{ replay: Replay }> = ({ replay }) => {
  const router = useRouter();

  // ✅ FONCTION DE NAVIGATION SELON L'ID DU REPLAY
  const handlePress = () => {
    switch (replay.id) {
      case "1":
        router.push("/replay1"); // Comment lever 500K€ en 48h
        break;
      case "2":
        router.push("/replay2"); // Masterclass Valorisation
        break;
      case "3":
        router.push("/replay3"); // Retour d'XP : Notre pivot
        break;
      default:
        router.push("/");
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={globalStyles.replayCard}>
      <View style={globalStyles.replayThumbnail}>
        <Image source={{ uri: replay.thumbnailUrl }} style={globalStyles.replayThumbnailImage} resizeMode="cover" />
        <View style={globalStyles.replayPlayButton}>
          <Icon name="play" size="lg" color={colors.primary} />
        </View>
        <View style={globalStyles.replayDuration}>
          <Text style={globalStyles.replayDurationText}>{replay.duration}</Text>
        </View>
      </View>
      <View style={globalStyles.replayInfo}>
        <Text style={globalStyles.replayTitle} numberOfLines={2}>{replay.title}</Text>
        <Text style={globalStyles.replayStartup}>{replay.startup}</Text>
        <View style={globalStyles.replayMeta}>
          <View style={globalStyles.replayMetaItem}>
            <Icon name="eye" size="sm" color={colors.textTertiary} />
            <Text style={globalStyles.replayMetaText}>{replay.views.toLocaleString()}</Text>
          </View>
          <View style={globalStyles.replayMetaItem}>
            <Icon name="location" size="sm" color={colors.textTertiary} />
            <Text style={globalStyles.replayMetaText}>{replay.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MailRow: React.FC<{ mail: MailItem }> = ({ mail }) => {
  const getMailIcon = (): string => {
    switch (mail.type) {
      case "rapport": return "chart";
      case "notification": return "bell";
      default: return "mail";
    }
  };

  return (
    <TouchableOpacity style={[globalStyles.mailRow, !mail.read && globalStyles.mailUnread]} activeOpacity={0.7}>
      <View style={[globalStyles.mailIconContainer, !mail.read && globalStyles.mailIconContainerUnread]}>
        <Icon name={getMailIcon()} size="md" color={mail.read ? colors.textSecondary : colors.white} />
      </View>
      <View style={globalStyles.mailContent}>
        <Text style={[globalStyles.mailSubject, !mail.read && globalStyles.mailSubjectUnread]} numberOfLines={1}>
          {mail.subject}
        </Text>
        <Text style={globalStyles.mailProject}>{mail.project}</Text>
      </View>
      <View style={globalStyles.mailMeta}>
        <Text style={globalStyles.mailDate}>{mail.date}</Text>
        {!mail.read && <View style={globalStyles.mailUnreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const progressPercent = (project.raised / project.goal) * 100;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={globalStyles.projectCard}>
      <View style={globalStyles.projectImageContainer}>
        <Image source={{ uri: project.imageUrl }} style={globalStyles.projectImage} resizeMode="cover" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={globalStyles.projectImageOverlay}
        />
        <TouchableOpacity style={globalStyles.projectFavoriteButton}>
          <Icon name="bookmark" size="md" color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={globalStyles.projectContent}>
        <View style={globalStyles.projectHeader}>
          <Text style={globalStyles.projectName}>{project.name}</Text>
          <View style={globalStyles.projectLocation}>
            <Icon name="location" size="sm" color={colors.textTertiary} />
            <Text style={globalStyles.projectCity}>{project.city}</Text>
          </View>
        </View>

        <View style={globalStyles.projectTags}>
          {project.tags.map((tag, index) => (
            <Badge key={index} label={tag} variant="neutral" />
          ))}
        </View>

        <View style={globalStyles.projectProgress}>
          <View style={globalStyles.projectProgressHeader}>
            <Text style={globalStyles.projectProgressPercent}>{Math.round(progressPercent)}%</Text>
            <Text style={globalStyles.projectProgressAmount}>
              {(project.raised / 1000).toFixed(0)}K € / {(project.goal / 1000).toFixed(0)}K €
            </Text>
          </View>
          <View style={globalStyles.projectProgressBar}>
            <Animated.View style={[globalStyles.projectProgressFill, { width: animatedWidth }]} />
          </View>
          <View style={globalStyles.projectProgressInfo}>
            <Text style={globalStyles.projectProgressLabel}>{project.daysLeft} jours restants</Text>
            <Text style={globalStyles.projectProgressLabel}>{project.investors} investisseurs</Text>
          </View>
        </View>

        <View style={globalStyles.projectInvestors}>
          <View style={globalStyles.projectInvestorAvatars}>
            {project.investorAvatars.slice(0, 3).map((avatar, index) => (
              <Image 
                key={index} 
                source={{ uri: avatar }} 
                style={[
                  globalStyles.projectInvestorAvatar,
                  index === 0 && globalStyles.projectInvestorAvatarFirst
                ]} 
              />
            ))}
          </View>
          <Text style={globalStyles.projectInvestorCount}>+{project.investors - 3} investisseurs</Text>
        </View>

        <View style={globalStyles.projectActions}>
          <View style={globalStyles.projectActionPrimary}>
            <Button label="Investir" variant="primary" fullWidth icon="arrow" iconPosition="right" />
          </View>
          <View style={globalStyles.projectActionSecondary}>
            <Button label="Détails" variant="outline" fullWidth />
          </View>
        </View>
      </View>
    </View>
  );
};

const SimpleChart: React.FC = () => {
  const data = [40, 65, 45, 80, 55, 90, 75, 85, 70, 95, 80, 88];
  const maxValue = Math.max(...data);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const currentMonth = new Date().getMonth();

  return (
    <View style={globalStyles.chartWrapper}>
      <View style={globalStyles.chartContainer}>
        {data.map((value, index) => {
          const heightAnim = useRef(new Animated.Value(0)).current;
          
          useEffect(() => {
            Animated.timing(heightAnim, {
              toValue: (value / maxValue) * 100,
              duration: 800,
              delay: index * 50,
              useNativeDriver: false,
            }).start();
          }, []);

          const animatedHeight = heightAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          });

          return (
            <View key={index} style={globalStyles.chartBarWrapper}>
              <View style={globalStyles.chartBarContainer}>
                <Animated.View 
                  style={[
                    globalStyles.chartBar, 
                    index === currentMonth && globalStyles.chartBarActive,
                    { height: animatedHeight }
                  ]} 
                />
              </View>
              <Text style={globalStyles.chartLabel}>{months[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// MapPreview MODIFIÉ pour accepter une fonction de navigation
const MapPreview: React.FC<{ geoFilter: GeoFilter; onExplore?: () => void }> = ({ geoFilter, onExplore }) => (
  <View style={globalStyles.mapPreview}>
    <View style={globalStyles.mapContainer}>
      <Image source={{ uri: IMAGES.map }} style={globalStyles.mapImage} resizeMode="cover" />
      <View style={globalStyles.mapLegend}>
        <View style={globalStyles.mapLegendLeft}>
          <Text style={globalStyles.mapLegendText}>
            {geoFilter === "local" && "Projets autour de vous"}
            {geoFilter === "france" && "Projets en France"}
            {geoFilter === "world" && "Projets internationaux"}
          </Text>
          <Text style={globalStyles.mapLegendCount}>
            {geoFilter === "local" ? "12" : geoFilter === "france" ? "47" : "63"} projets actifs
          </Text>
        </View>
        <TouchableOpacity style={globalStyles.mapExpandButton} onPress={onExplore}>
          <Text style={globalStyles.mapExpandButtonText}>Explorer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  variant?: "default" | "gradient" | "dark";
}> = ({ label, value, subValue, trend, icon, variant = "default" }) => {
  const content = (
    <>
      {icon && (
        <View style={[globalStyles.statIconContainer, variant === "dark" && { backgroundColor: "rgba(255,255,255,0.1)" }]}>
          <Icon name={icon} size="md" color={variant === "dark" ? colors.white : colors.primary} />
        </View>
      )}
      <Text style={[globalStyles.statLabel, variant === "dark" && globalStyles.statLabelLight]}>{label}</Text>
      <Text style={[globalStyles.statValue, variant === "dark" && globalStyles.statValueLight]}>{value}</Text>
      {subValue && (
        <View style={globalStyles.statSubValueContainer}>
          {trend && (
            <Icon 
              name={trend === "up" ? "trending" : trend === "down" ? "trending-down" : "arrow"} 
              size="sm" 
              color={trend === "up" ? colors.success : trend === "down" ? colors.danger : colors.textTertiary}
            />
          )}
          <Text style={[
            globalStyles.statSubValue, 
            trend === "up" && globalStyles.textPositive, 
            trend === "down" && globalStyles.textNegative,
            variant === "dark" && { color: "rgba(255,255,255,0.8)" }
          ]}>
            {subValue}
          </Text>
        </View>
      )}
    </>
  );

  if (variant === "gradient") {
    return (
      <GradientCard colors={[colors.primary, colors.accent]} style={globalStyles.statCard}>
        {content}
      </GradientCard>
    );
  }

  return (
    <View style={[globalStyles.statCard, variant === "dark" && globalStyles.statCardDark]}>
      {content}
    </View>
  );
};

const TrendingCard: React.FC<{ item: TrendingItem; rank: number }> = ({ item, rank }) => {
  const router = useRouter();

  const handlePress = () => {
    // Redirection selon le rang
    if (rank === 1) {
      router.push("/projet1");
    } else if (rank === 2) {
      router.push("/projet2");
    } else if (rank === 3) {
      router.push("/projet4");
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={globalStyles.trendingCard}>
        <View style={[globalStyles.trendingRank, rank <= 3 && globalStyles.trendingRankTop]}>
          <Text style={[globalStyles.trendingRankText, rank <= 3 && globalStyles.trendingRankTextTop]}>{rank}</Text>
        </View>
        <Image source={{ uri: item.imageUrl }} style={globalStyles.trendingImage} />
        <View style={globalStyles.trendingInfo}>
          <Text style={globalStyles.trendingName}>{item.name}</Text>
          <Text style={globalStyles.trendingMeta}>{item.sector}</Text>
        </View>
        <View style={globalStyles.trendingChange}>
          <Text style={[globalStyles.trendingChangeValue, globalStyles.textPositive]}>+{item.change}%</Text>
          <Text style={globalStyles.trendingChangeLabel}>7 jours</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============ SMART FAB COMPONENT (CORRIGÉ & COMPLET) ============
const SmartActionFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const actions = [
    { 
      label: "Nouvelle analyse", 
      subLabel: "Publier un rapport",
      icon: "plus", 
      color: "#6366F1", 
      textColor: "#FFFFFF" 
    },
    { 
      label: "Vendre / Arbitrer", 
      subLabel: "Retirer des fonds",
      icon: "trending-down", 
      color: colors.warning, 
      textColor: "#FFFFFF" 
    },
    { 
      label: "Investir", 
      subLabel: "Acheter des parts",
      icon: "trending-up", 
      color: colors.success, 
      textColor: "#FFFFFF" 
    },
    { 
      label: "Déposer", 
      subLabel: "Alimenter le compte",
      icon: "plus-circle", 
      color: colors.textPrimary, 
      textColor: "#FFFFFF" 
    },
  ];

  return (
    <>
      <TouchableWithoutFeedback onPress={toggleMenu}>
        <Animated.View 
          style={[
            fabStyles.overlay, 
            { opacity: overlayOpacity },
          ]} 
          // Permet de cliquer à travers l'overlay s'il est invisible
          pointerEvents={isOpen ? "auto" : "none"} 
        />
      </TouchableWithoutFeedback>

      {/* box-none permet de cliquer à travers le conteneur vide */}
      <View style={fabStyles.container} pointerEvents="box-none">
        <View style={fabStyles.actionsContainer} pointerEvents={isOpen ? "auto" : "none"}>
          {actions.map((action, index) => {
            const reverseIndex = actions.length - index; 
            
            const translateY = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [20 * reverseIndex, 0],
            });
            
            const scale = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });

            const opacity = animation.interpolate({
              inputRange: [0, 0.2 + (index * 0.1), 1],
              outputRange: [0, 0, 1],
            });

            return (
              <Animated.View
                key={action.label}
                style={[
                  fabStyles.actionRow,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }]
                  }
                ]}
              >
                <View style={fabStyles.actionLabelContainer}>
                  <Text style={fabStyles.actionLabelTitle}>{action.label}</Text>
                  <Text style={fabStyles.actionLabelSubtitle}>{action.subLabel}</Text>
                </View>

                <TouchableOpacity 
                  style={[fabStyles.actionButton, { backgroundColor: action.color }]} 
                  activeOpacity={0.8}
                  onPress={() => {
                    console.log(`Action: ${action.label}`);
                    toggleMenu();
                  }}
                >
                    <Icon name={action.icon} size="md" color={action.textColor} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity 
          onPress={toggleMenu} 
          activeOpacity={0.9} 
          style={fabStyles.fabWrapper}
        >
          <LinearGradient
            colors={isOpen ? [colors.neutral800, colors.neutral900] : colors.gradientPrimary as [string, string]}
            style={fabStyles.fab}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Icon name="plus" size="lg" color={colors.white} />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
};

// ============ MAIN COMPONENT ============
const Index: React.FC = () => {
  const router = useRouter(); // Hook de navigation Expo Router

  const [activeTab, setActiveTab] = useState<ActiveTab>("feed");
  const [geoFilter, setGeoFilter] = useState<GeoFilter>("france");
  const [mailTab, setMailTab] = useState<"inbox" | "reports" | "notifications">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  
  // États pour scroll & refresh
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Refresh Logic
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Scroll To Top Logic
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handler du Scroll pour afficher le bouton retour en haut
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 400 && !showScrollTop) {
          setShowScrollTop(true);
        } else if (offsetY <= 400 && showScrollTop) {
          setShowScrollTop(false);
        }
      },
    }
  );

  const filteredProjects = MOCK_PROJECTS.filter(
    (p) => geoFilter === "france" || p.region === geoFilter || geoFilter === "world"
  );

  const totalInvested = MOCK_PORTFOLIO.reduce((sum, item) => sum + item.value, 0);
  const totalVariation = MOCK_PORTFOLIO.reduce((sum, item) => sum + item.value * (item.variation / 100), 0);
  const variationPercent = (totalVariation / (totalInvested - totalVariation)) * 100;
  const unreadMailCount = MOCK_MAILS.filter((m) => !m.read).length;

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "feed", label: "Feed" },
    { key: "invest", label: "Investir" },
    { key: "live", label: "Live" },
    { key: "map", label: "Carte" },
    { key: "mail", label: "Boîte mail" },
  ];

  const geoOptions = [
    { key: "local", label: "Autour de moi" },
    { key: "france", label: "France" },
    { key: "world", label: "International" },
  ];

  const mailTabs = [
    { key: "inbox", label: "Réception" },
    { key: "reports", label: "Rapports" },
    { key: "notifications", label: "Alertes" },
  ];

  // ===== HEADER =====
  const renderHeader = () => {
    const safeTopPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 60;
    
    return (
      <View style={[globalStyles.header, { paddingTop: safeTopPadding }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} translucent />
        
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.searchInputWrapper}>
            <Icon name="search" size="sm" color={colors.textTertiary} />
            <TextInput 
              style={globalStyles.searchInput}
              placeholder="Rechercher startups, investisseurs..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity style={globalStyles.notificationButton} activeOpacity={0.7}>
            <Icon name="bell" size="md" color={colors.textPrimary} />
            <View style={globalStyles.notificationBadge}>
                <Text style={globalStyles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  const renderNavigation = () => (
    <View style={globalStyles.navigation}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={globalStyles.navigationContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[globalStyles.navTab, activeTab === tab.key && globalStyles.navTabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[globalStyles.navTabText, activeTab === tab.key && globalStyles.navTabTextActive]}>
              {tab.label}
            </Text>
            {tab.key === "mail" && unreadMailCount > 0 && (
              <View style={globalStyles.navBadge}>
                <Text style={globalStyles.navBadgeText}>{unreadMailCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHeroSection = () => (
    <View style={globalStyles.heroSection}>
      <LinearGradient
        colors={[colors.primaryDark, "#0F172A"] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={globalStyles.heroCard}
      >
        <View style={globalStyles.heroTopContent}>
          <View style={globalStyles.heroTextContainer}>
            <View style={globalStyles.heroBadge}>
              <Icon name="trending-up" size="sm" color={colors.accentLight} />
              <Text style={globalStyles.heroBadgeText}>+12% rendement moy.</Text>
            </View>
            <Text style={globalStyles.heroTitle}>
              Façonnez l'économie de demain.
            </Text>
            <Text style={globalStyles.heroSubtitle}>
              Accédez au capital des startups les plus ambitieuses. Investissez dès 100€.
            </Text>
            
            <TouchableOpacity 
              style={globalStyles.heroCTA} 
              activeOpacity={0.8}
              onPress={() => router.push("/marketplace")}
            >
              <Text style={globalStyles.heroCTAText}>Explorer les pépites</Text>
              <Icon name="arrow-right" size="sm" color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={globalStyles.heroGridContainer}>
            <View style={globalStyles.heroGridColumn}>
              <View style={[globalStyles.heroImageCard, { marginBottom: 12 }]}>
                <Image source={{ uri: IMAGES.startups[0] }} style={globalStyles.heroImage} />
                <View style={globalStyles.heroMiniLogo}>
                    <Text style={globalStyles.heroMiniLogoText}>G</Text>
                </View>
              </View>
              <View style={globalStyles.heroImageCard}>
                <Image source={{ uri: IMAGES.startups[1] }} style={globalStyles.heroImage} />
                  <View style={globalStyles.heroMiniLogo}>
                    <Text style={globalStyles.heroMiniLogoText}>F</Text>
                </View>
              </View>
            </View>
            <View style={[globalStyles.heroGridColumn, { marginTop: 24 }]}>
                <View style={[globalStyles.heroImageCard, { marginBottom: 12 }]}>
                <Image source={{ uri: IMAGES.startups[2] }} style={globalStyles.heroImage} />
                  <View style={globalStyles.heroMiniLogo}>
                    <Text style={globalStyles.heroMiniLogoText}>M</Text>
                </View>
              </View>
              <View style={globalStyles.heroStatFloating}>
                <Text style={globalStyles.heroStatFloatingValue}>18K</Text>
                <Text style={globalStyles.heroStatFloatingLabel}>Invst.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={globalStyles.heroKPIContainer}>
          <View style={globalStyles.heroKPIItem}>
            <Text style={globalStyles.heroKPIValue}>2.4M€</Text>
            <Text style={globalStyles.heroKPILabel}>Levés ce mois</Text>
          </View>
          <View style={globalStyles.heroKPIDivider} />
          <View style={globalStyles.heroKPIItem}>
            <Text style={globalStyles.heroKPIValue}>127</Text>
            <Text style={globalStyles.heroKPILabel}>Projets actifs</Text>
          </View>
          <View style={globalStyles.heroKPIDivider} />
          <View style={globalStyles.heroKPIItem}>
            <Text style={globalStyles.heroKPIValue}>0€</Text>
            <Text style={globalStyles.heroKPILabel}>Frais d'entrée</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderStories = () => (
    <View style={globalStyles.storiesSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={globalStyles.storiesScroll}
      >
        {MOCK_STORIES.map((story, index) => (
          <StoryItem key={story.id} story={story} index={index} />
        ))}
      </ScrollView>
    </View>
  );

  const renderGeoSelector = () => (
    <View style={globalStyles.geoSelector}>
      <SegmentedControl
        options={geoOptions}
        selected={geoFilter}
        onChange={(key) => setGeoFilter(key as GeoFilter)}
      />
    </View>
  );

  const renderQuickStats = () => (
    <View style={globalStyles.statsRow}>
      <StatCard
        label="Portefeuille"
        value={`${(totalInvested + totalVariation).toLocaleString("fr-FR")} €`}
        subValue={`${variationPercent >= 0 ? "+" : ""}${variationPercent.toFixed(1)}%`}
        trend={variationPercent >= 0 ? "up" : "down"}
        icon="wallet"
      />
      <StatCard
        label="Lives"
        value="3"
        subValue="1 en direct"
        icon="play"
        variant="dark"
      />
    </View>
  );

  const renderTrending = () => (
    <View style={globalStyles.trendingSection}>
      <SectionHeader 
        title="Tendances" 
        subtitle="Les startups qui performent" 
        action="Voir tout" 
        onAction={() => router.push("/tendances")}
        compact 
      />
      {MOCK_TRENDING.map((item, index) => (
        <TrendingCard key={item.id} item={item} rank={index + 1} />
      ))}
    </View>
  );

  const renderFeedContent = () => (
    <View style={globalStyles.feedContent}>
      {renderStories()}
      {renderQuickStats()}
      {renderTrending()}
      <SectionHeader title="Fil d'actualité" action="Actualiser" />
      {MOCK_POSTS.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </View>
  );

  const renderInvestorDashboard = () => (
    <View style={globalStyles.dashboardSection}>
      <SectionHeader title="Mon portefeuille" subtitle="Performance globale" action="Détails" />
      
      <View style={globalStyles.portfolioContainer}>
        <Card variant="elevated">
          <View style={globalStyles.portfolioHeader}>
            <Text style={globalStyles.portfolioTotalLabel}>Valeur totale</Text>
            <Text style={globalStyles.portfolioTotalValue}>
              {(totalInvested + totalVariation).toLocaleString("fr-FR")} €
            </Text>
            <View style={globalStyles.portfolioTotalChange}>
              <Icon 
                name={variationPercent >= 0 ? "trending" : "trending-down"} 
                size="sm" 
                color={variationPercent >= 0 ? colors.success : colors.danger} 
              />
              <Text style={[globalStyles.statSubValue, variationPercent >= 0 ? globalStyles.textPositive : globalStyles.textNegative]}>
                {variationPercent >= 0 ? "+" : ""}{variationPercent.toFixed(1)}% ce mois
              </Text>
            </View>
          </View>
          
          <Divider variant="light" />
          
          <Text style={globalStyles.chartTitle}>Performance 2024</Text>
          <SimpleChart />
        </Card>

        <Card variant="outlined" style={{ marginTop: spacing.md }}>
          <Text style={globalStyles.portfolioTitle}>Mes participations</Text>
          {MOCK_PORTFOLIO.map((item, index) => (
            <PortfolioRow 
              key={item.id} 
              item={item} 
              isLast={index === MOCK_PORTFOLIO.length - 1} 
            />
          ))}
        </Card>
      </View>

      <View style={globalStyles.dashboardActions}>
        <Button label="Voir le portefeuille complet" variant="primary" fullWidth />
        <View style={globalStyles.actionsRow}>
          <Button label="Investir" variant="outline" fullWidth />
          <Button label="Copy Wallet" variant="outline" fullWidth icon="copy" />
        </View>
      </View>
    </View>
  );

  const renderLiveReplayContent = () => (
    <View style={globalStyles.liveReplaySection}>
      <SectionHeader title="En direct" subtitle="Rejoignez les présentations" action="Tous les lives" />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={globalStyles.horizontalScroll}
      >
        {MOCK_LIVES.map((live) => (
          <View key={live.id} style={globalStyles.horizontalCard}>
            <LiveCard live={live} />
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="Replays" subtitle="Rattrapez les sessions passées" action="Tous les replays" />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={globalStyles.horizontalScroll}
      >
        {MOCK_REPLAYS.map((replay) => (
          <View key={replay.id} style={globalStyles.horizontalCard}>
            <ReplayCard replay={replay} />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderMailContent = () => (
    <View style={globalStyles.mailSection}>
      <View style={globalStyles.mailContainer}>
        <Card variant="elevated">
          <View style={globalStyles.mailHeader}>
            <View style={globalStyles.mailHeaderLeft}>
              <View style={globalStyles.mailIconLarge}>
                <Icon name="mail" size="lg" color={colors.primary} />
              </View>
              <View>
                <Text style={globalStyles.mailHeaderTitle}>Boîte mail</Text>
                <Text style={globalStyles.mailHeaderSubtitle}>Rapports et notifications</Text>
              </View>
            </View>
            {unreadMailCount > 0 && (
              <View style={globalStyles.mailCountBadge}>
                <Text style={globalStyles.mailCountText}>{unreadMailCount}</Text>
              </View>
            )}
          </View>

          <SegmentedControl
            options={mailTabs}
            selected={mailTab}
            onChange={(key) => setMailTab(key as typeof mailTab)}
          />

          <View style={globalStyles.mailList}>
            {MOCK_MAILS.filter((mail) => {
              if (mailTab === "reports") return mail.type === "rapport";
              if (mailTab === "notifications") return mail.type === "notification";
              return true;
            }).map((mail) => (
              <MailRow key={mail.id} mail={mail} />
            ))}
          </View>

          <Button label="Ouvrir la boîte mail" variant="primary" fullWidth icon="external" iconPosition="right" />
        </Card>
      </View>
    </View>
  );

  const renderMapContent = () => (
    <View style={globalStyles.mapSection}>
      <SectionHeader title="Carte des projets" subtitle="Découvrez les opportunités" action="Plein écran" />
      {renderGeoSelector()}
      <MapPreview 
        geoFilter={geoFilter} 
        onExplore={() => router.push("/cartefrance")}
      />
      
      <SectionHeader title="À découvrir" compact />
      {filteredProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "feed":
        return renderFeedContent();
      case "invest":
        return (
          <>
            {renderHeroSection()}
            {renderGeoSelector()}
            {renderInvestorDashboard()}
          </>
        );
      case "live":
        return renderLiveReplayContent();
      case "map":
        return renderMapContent();
      case "mail":
        return renderMailContent();
      default:
        return (
          <View style={globalStyles.placeholderSection}>
            <View style={globalStyles.placeholderIcon}>
              <Icon name="sparkle" size="xl" color={colors.textTertiary} />
            </View>
            <Text style={globalStyles.placeholderTitle}>Bientôt disponible</Text>
            <Text style={globalStyles.placeholderText}>
              Cette fonctionnalité arrive très prochainement. Restez connecté !
            </Text>
            <Button label="Retour au feed" variant="outline" icon="arrow-left" />
          </View>
        );
    }
  };

  const renderScrollTopButton = () => {
    if (!showScrollTop) return null;

    return (
      <TouchableOpacity
        onPress={scrollToTop}
        style={scrollTopStyles.button}
        activeOpacity={0.8}
      >
        <Icon name="arrow-up" size="md" color={colors.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {renderHeader()}
      {renderNavigation()}
      <Animated.ScrollView 
        ref={scrollViewRef}
        style={globalStyles.scrollView}
        contentContainerStyle={[globalStyles.scrollViewContent, { paddingBottom: 100 }]} // Padding extra pour le FAB
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={40}
          />
        }
      >
        {renderTabContent()}

        <View style={globalStyles.footer}>
          <View style={globalStyles.footerLogo}>
            <Text style={globalStyles.footerLogoText}>LPP</Text>
          </View>
          <Text style={globalStyles.footerText}>La Première Pierre</Text>
          <Text style={globalStyles.footerSubtext}>Plateforme d'investissement participatif</Text>
          <View style={globalStyles.footerLinks}>
            <Text style={globalStyles.footerLink}>CGU</Text>
            <Text style={globalStyles.footerLink}>Confidentialité</Text>
            <Text style={globalStyles.footerLink}>Support</Text>
          </View>
          <Text style={globalStyles.footerCopyright}>© 2024 LPP. Tous droits réservés.</Text>
        </View>
      </Animated.ScrollView>
      
      {/* Boutons flottants */}
      {renderScrollTopButton()}
      <SmartActionFAB />
      
    </SafeAreaView>
  );
};

// Styles locaux pour les composants spécifiques à cette page
const fabStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    zIndex: 998,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    alignItems: 'flex-end',
    zIndex: 999,
    paddingBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'flex-end',
    minWidth: 200,
  },
  actionLabelContainer: {
    backgroundColor: 'transparent', 
    alignItems: 'flex-end',
    marginRight: 16,
  },
  actionLabelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionLabelSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fabWrapper: {
    zIndex: 1000,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

const scrollTopStyles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 110, // Juste au-dessus du Smart FAB
    right: 28,   // Alignement visuel avec le centre du FAB
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 900,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});

export default Index;