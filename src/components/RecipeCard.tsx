// src/components/RecipeCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RecipeCardProps {
    imageUri: string;
    title: string;
    cookTime: number; // Thời gian nấu (phút)
    ration: number; // Khẩu phần (số người)
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'; // Độ khó
    onPress?: () => void;
    isPrivate?: boolean; 
}

/**
 * Hiển thị số sao dựa trên độ khó.
 * EASY = 1 vàng, 2 xám; MEDIUM = 2 vàng, 1 xám; HARD = 3 vàng.
 */
const renderDifficultyStars = (difficulty: RecipeCardProps['difficulty']) => {
    let starCount = 0;
    const upperCaseDifficulty = difficulty ? difficulty.toUpperCase() : 'EASY';

    if (upperCaseDifficulty === 'EASY') starCount = 1;
    else if (upperCaseDifficulty === 'MEDIUM') starCount = 2;
    else if (upperCaseDifficulty === 'HARD') starCount = 3;

    return [...Array(3)].map((_, i) => (
        <Icon 
            key={i}
            name="star"
            size={12}
            color={i < starCount ? '#FFB800' : '#E5E7EB'} 
            style={styles.starIcon}
        />
    ));
};

const RecipeCard: React.FC<RecipeCardProps> = ({ 
    imageUri, 
    title, 
    cookTime, 
    ration, 
    difficulty, 
    onPress, 
    isPrivate = false 
}) => {
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.7}>
            {/* Image Container với Overlay */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.recipeImage} />
                <View style={styles.imageOverlay} />
                
                {/* Private Badge */}
                {isPrivate && (
                    <View style={styles.privateBadge}>
                        <Icon name="lock" size={12} color="#FFFFFF" />
                    </View>
                )}
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
                {/* Title */}
                <Text style={styles.recipeTitle} numberOfLines={2} ellipsizeMode="tail">
                    {title}
                </Text>
                
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {/* Cook Time */}
                    <View style={styles.statItem}>
                        <View style={styles.statIconBg}>
                            <Icon name="clock-outline" size={14} color="#8BC34A" />
                        </View>
                        <Text style={styles.statText}>{cookTime}p</Text>
                    </View>
                    
                    {/* Ration */}
                    <View style={styles.statItem}>
                        <View style={styles.statIconBg}>
                            <Icon name="account-group-outline" size={14} color="#3B82F6" />
                        </View>
                        <Text style={styles.statText}>{ration} người</Text>
                    </View>
                </View>
                
                {/* Difficulty Row */}
                <View style={styles.difficultyContainer}>
                    <Text style={styles.difficultyLabel}>Độ khó</Text>
                    <View style={styles.starsContainer}>
                        {renderDifficultyStars(difficulty)}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '48%', 
        marginVertical: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    
    // Image Section
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 130,
    },
    recipeImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    privateBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    // Content Section
    contentContainer: {
        padding: 12,
    },
    recipeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 10,
        lineHeight: 18,
        height: 36, // Đủ cho 2 dòng
    },
    
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statIconBg: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    
    // Difficulty Row
    difficultyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    difficultyLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    starIcon: {
        marginHorizontal: 1,
    },
});

export default RecipeCard;