// components/Live.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============ COLORS ============
const colors = {
  primary: "#0052FF",
  primaryDark: "#0039B3",
  primaryLight: "#E6EFFF",
  
  success: "#10B981",
  successLight: "#D1FAE5",
  
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  
  white: "#FFFFFF",
  black: "#000000",
  background: "#FAFBFC",
  
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  
  overlay: "rgba(15, 23, 42, 0.85)",
  overlayLight: "rgba(15, 23, 42, 0.4)",
  
  live: "#EF4444",
  liveGlow: "rgba(239, 68, 68, 0.4)",
};

// ============ TYPES ============
interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
}

interface Reaction {
  type: "like" | "fire" | "rocket" | "clap";
  emoji: string;
}

// ============ MOCK DATA ============
const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Sophie Martin",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    text: "Super intéressant ce projet ! 🚀",
    timestamp: "Il y a 2 min",
  },
  {
    id: "2",
    author: "Marc Dubois",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    text: "Quel est le ticket minimum pour investir ?",
    timestamp: "Il y a 3 min",
  },
  {
    id: "3",
    author: "Léa Bernard",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
    text: "L'équipe a l'air vraiment compétente 👏",
    timestamp: "Il y a 5 min",
  },
  {
    id: "4",
    author: "Thomas Laurent",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    text: "Belle opportunité d'investissement !",
    timestamp: "Il y a 7 min",
  },
];

const REACTIONS: Reaction[] = [
  { type: "like", emoji: "👍" },
  { type: "fire", emoji: "🔥" },
  { type: "rocket", emoji: "🚀" },
  { type: "clap", emoji: "👏" },
];

// ============ ANIMATED COMPONENTS ============
const LiveBadge = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.liveDot} />
      <Text style={styles.liveBadgeText}>LIVE</Text>
    </Animated.View>
  );
};

const FloatingReaction = ({ emoji, onComplete }: { emoji: string; onComplete: () => void }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingReaction,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

// ============ MAIN COMPONENT ============
const Live = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // États
  const [viewers, setViewers] = useState(1247);
  const [likes, setLikes] = useState(1834);
  const [showComments, setShowComments] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string }[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);

  // Simulation de variation du nombre de viewers
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    addFloatingReaction("❤️");
  };

  const handleReaction = (reaction: Reaction) => {
    addFloatingReaction(reaction.emoji);
  };

  const addFloatingReaction = (emoji: string) => {
    const id = Date.now().toString();
    setFloatingReactions((prev) => [...prev, { id, emoji }]);
  };

  const removeFloatingReaction = (id: string) => {
    setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: "Vous",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
        text: comment,
        timestamp: "À l'instant",
      };
      setComments([newComment, ...comments]);
      setComment("");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Video Background (simulé avec une image) */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1080&h=1920&fit=crop" }}
        style={styles.videoBackground}
        resizeMode="cover"
      />
      
      {/* Overlay sombre */}
      <View style={styles.darkOverlay} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <LiveBadge />
          <View style={styles.viewersContainer}>
            <Feather name="eye" size={14} color={colors.white} />
            <Text style={styles.viewersText}>{viewers.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share-2" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Info Startup (en haut à gauche) */}
      <TouchableOpacity 
        style={styles.startupInfo}
        onPress={() => setShowInfo(!showInfo)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop" }}
          style={styles.startupAvatar}
        />
        <View style={styles.startupDetails}>
          <Text style={styles.startupName}>Virtual Estate</Text>
          <Text style={styles.pitchTitle}>Pitch Live - Levée de fonds</Text>
        </View>
        <Feather name={showInfo ? "chevron-up" : "chevron-down"} size={20} color={colors.white} />
      </TouchableOpacity>

      {/* Panel d'info (conditionnel) */}
      {showInfo && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoPanelTitle}>À propos du projet</Text>
          <Text style={styles.infoPanelText}>
            Visites immobilières en réalité augmentée.
          </Text>
          <View style={styles.infoStats}>
            <View style={styles.infoStat}>
              <Text style={styles.infoStatValue}>3.2M€</Text>
              <Text style={styles.infoStatLabel}>Objectif</Text>
            </View>
            <View style={styles.infoStat}>
              <Text style={styles.infoStatValue}>67%</Text>
              <Text style={styles.infoStatLabel}>Financé</Text>
            </View>
            <View style={styles.infoStat}>
              <Text style={styles.infoStatValue}>8j</Text>
              <Text style={styles.infoStatLabel}>Restants</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.investButton}
            onPress={() => router.push("/projet6")} 
          >
            <LinearGradient
              colors={[colors.primary, "#00C6FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.investButtonGradient}
            >
              <Text style={styles.investButtonText}>Investir maintenant</Text>
              <Feather name="arrow-right" size={18} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      {/* Reactions flottantes */}
      <View style={styles.floatingReactionsContainer}>
        {floatingReactions.map((reaction) => (
          <FloatingReaction
            key={reaction.id}
            emoji={reaction.emoji}
            onComplete={() => removeFloatingReaction(reaction.id)}
          />
        ))}
      </View>

      {/* Actions à droite */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          {/* CORRECTION ICI : Suppression de la prop style invalide */}
          <Feather
            name={isLiked ? "heart" : "heart"}
            size={28}
            color={isLiked ? colors.danger : colors.white}
          />
          <Text style={styles.actionButtonText}>{likes.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <Feather name="message-circle" size={28} color={colors.white} />
          <Text style={styles.actionButtonText}>{comments.length}</Text>
        </TouchableOpacity>

        {REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.type}
            style={styles.actionButtonSmall}
            onPress={() => handleReaction(reaction)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section commentaires (en bas) */}
      {showComments && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.commentsSection}
          keyboardVerticalOffset={0}
        >
          <LinearGradient
            colors={["transparent", colors.overlay]}
            style={styles.commentsGradient}
          >
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Chat en direct</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Feather name="x" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.commentsList}
              contentContainerStyle={styles.commentsListContent}
              showsVerticalScrollIndicator={false}
            >
              {comments.map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <Image source={{ uri: c.avatarUrl }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{c.author}</Text>
                      <Text style={styles.commentTime}>{c.timestamp}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.commentInput}>
              <TextInput
                style={styles.input}
                placeholder="Poser une question..."
                placeholderTextColor={colors.textTertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
                disabled={!comment.trim()}
              >
                <Feather name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayLight,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Live Badge
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.live,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: colors.live,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  liveBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },

  // Viewers
  viewersContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  viewersText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },

  // Startup Info
  startupInfo: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 60 : 72,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 16,
    gap: 12,
    zIndex: 9,
  },
  startupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  startupDetails: {
    flex: 1,
  },
  startupName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  pitchTitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },

  // Info Panel
  infoPanel: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 140 : 152,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    padding: 20,
    borderRadius: 20,
    zIndex: 8,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 12,
  },
  infoPanelText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
    marginBottom: 16,
  },
  infoStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  infoStat: {
    alignItems: "center",
  },
  infoStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
  },
  infoStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  investButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  investButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  investButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },

  // Floating Reactions
  floatingReactionsContainer: {
    position: "absolute",
    bottom: 280,
    right: 16,
    width: 60,
    alignItems: "center",
  },
  floatingReaction: {
    fontSize: 32,
    position: "absolute",
    bottom: 0,
  },

  // Right Actions
  rightActions: {
    position: "absolute",
    right: 16,
    bottom: 180,
    alignItems: "center",
    gap: 24,
    zIndex: 5,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  reactionEmoji: {
    fontSize: 24,
  },

  // Comments Section
  commentsSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.5,
    zIndex: 10,
  },
  commentsGradient: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: Platform.OS === "android" ? 20 : 34,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentsListContent: {
    paddingBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  commentTime: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },
  commentText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 20,
  },

  // Comment Input
  commentInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.white,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(0, 82, 255, 0.5)",
  },
});

export default Live;