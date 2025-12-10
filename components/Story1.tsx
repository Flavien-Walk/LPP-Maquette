// app/story1.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { colors, radius, spacing, typography } from "../styles/indexStyles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock Data pour GreenTech
const STORY_DATA = {
  id: "1",
  author: "GreenTech Lyon",
  avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=150&fit=crop", // Même image que Index
  image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=1200&fit=crop", // Image verticale panneaux solaires
  time: "2h",
  title: "Installation terminée ! ☀️",
  description: "Notre parc solaire de Lyon est 100% opérationnel. Le rendement dépasse nos espérances de +15%.",
  raised: "320K€",
  goal: "400K€",
};

const DURATION = 5000; // 5 secondes

export default function StoryScreen() {
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [isPaused, setIsPaused] = useState(false);

  // Gestion de l'animation de la barre de progression
  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        closeStory();
      }
    });
  };

  const closeStory = () => {
    router.back();
  };

  const handlePressIn = () => {
    setIsPaused(true);
    progressAnim.stopAnimation();
  };

  const handlePressOut = () => {
    setIsPaused(false);
    // On reprend l'animation là où elle s'était arrêtée
    // Note: Une implémentation complexe calculerait le temps restant, 
    // ici on simplifie pour l'exemple en relançant vers la fin.
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: DURATION * (1 - (progressAnim as any)._value), 
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) closeStory();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Image de fond */}
      <Image source={{ uri: STORY_DATA.image }} style={styles.backgroundImage} resizeMode="cover" />
      
      {/* Overlay sombre pour la lisibilité */}
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.8)"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Zone tactile pour pause/navigation */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={closeStory} // Un tap ferme ou passe à la suivante (ici ferme)
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Barre de progression */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Header (Auteur + Croix) */}
        <View style={styles.header}>
          <View style={styles.authorContainer}>
            <Image source={{ uri: STORY_DATA.avatar }} style={styles.avatar} />
            <Text style={styles.authorName}>{STORY_DATA.author}</Text>
            <Text style={styles.time}>{STORY_DATA.time}</Text>
          </View>
          
          <TouchableOpacity onPress={closeStory} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Contenu du bas */}
        <View style={styles.footer} pointerEvents="box-none">
          <View style={styles.textContainer}>
            <Text style={styles.title}>{STORY_DATA.title}</Text>
            <Text style={styles.description}>{STORY_DATA.description}</Text>
          </View>

          {/* KPI Rapides */}
          <View style={styles.kpiContainer}>
            <View style={styles.kpiBadge}>
              <Feather name="trending-up" size={14} color={colors.success} />
              <Text style={styles.kpiText}>Rendement +15%</Text>
            </View>
            <View style={[styles.kpiBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
               <Text style={styles.kpiText}>Objectif: {STORY_DATA.raised} / {STORY_DATA.goal}</Text>
            </View>
          </View>

          {/* Bouton d'action (CTA) */}
          <TouchableOpacity 
            style={styles.ctaButton}
            activeOpacity={0.9}
            onPress={() => {
              // Ici on pourrait rediriger vers la page détail du projet
              router.push("/projet1"); 
            }}
          >
            <Text style={styles.ctaText}>Voir le projet</Text>
            <Feather name="arrow-right" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  // Progress Bar
  progressBarContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.full,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.white,
  },
  authorName: {
    color: colors.white,
    fontWeight: typography.fontWeightSemibold,
    fontSize: typography.fontSizeSm,
  },
  time: {
    color: "rgba(255,255,255,0.7)",
    fontSize: typography.fontSizeXs,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  // Footer Content
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  textContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: typography.fontSizeXxl,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    color: colors.neutral200,
    fontSize: typography.fontSizeMd,
    lineHeight: 24,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  kpiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  kpiText: {
    color: colors.white,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
  },
  // CTA Button
  ctaButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    borderRadius: radius.full,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: colors.white,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    letterSpacing: 0.5,
  },
});