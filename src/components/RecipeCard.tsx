// src/components/RecipeCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RecipeCardProps {
    imageUri: string;
    title: string;
    // ⭐ THAY THẾ views
    cookTime: number; // Thời gian nấu (phút)
    ration: number; // Khẩu phần (số người)
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'; // Độ khó
    onPress?: () => void;
    isPrivate?: boolean; 
}

/**
 * Hiển thị số sao dựa trên độ khó.
 * EASY = 1 vàng, 2 xám; MEDIUM = 2 vàng, 1 xám; HARD = 3 vàng.
 * @param difficulty Giá trị độ khó.
 * @returns Array<React.ReactElement>
 */
const renderDifficultyStars = (difficulty: RecipeCardProps['difficulty']) => {
    let starCount = 0;
    const upperCaseDifficulty = difficulty ? difficulty.toUpperCase() : 'EASY';

    if (upperCaseDifficulty === 'EASY') starCount = 1;
    else if (upperCaseDifficulty === 'MEDIUM') starCount = 2;
    else if (upperCaseDifficulty === 'HARD') starCount = 3;

    // Tạo 3 biểu tượng ngôi sao
    return [...Array(3)].map((_, i) => (
        <Icon 
            key={i}
            name="star"
            size={14}
            // Tô màu vàng nếu chỉ mục nhỏ hơn số sao cần hiển thị
            color={i < starCount ? '#FFD700' : '#ccc'} 
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
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            <Image source={{ uri: imageUri }} style={styles.recipeImage} />
            <View style={styles.infoOverlay}>
                <Text style={styles.recipeTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
                
                {/* DÒNG 1: THỜI GIAN NẤU & KHẨU PHẦN */}
                <View style={styles.statsRow}>
                    
                    {/* Thời gian nấu */}
                    <View style={styles.statItem}>
                        <Icon name="clock-time-four-outline" size={14} color="#8BC34A" style={styles.statIcon} />
                        <Text style={styles.statText}>{cookTime} phút</Text>
                    </View>
                    
                    {/* Khẩu phần */}
                    <View style={styles.statItem}>
                        <Icon name="account-group-outline" size={14} color="#8BC34A" style={styles.statIcon} />
                        <Text style={styles.statText}>{ration} người</Text>
                    </View>
                </View>
                
                {/* DÒNG 2: ĐỘ KHÓ & PRIVATE ICON */}
                <View style={styles.difficultyRow}>
                    {/* THÊM CHỮ "Độ khó" */}
                    <View style={styles.difficultyInfo}>
                        <Text style={styles.difficultyLabel}>Độ khó</Text> 
                        <View style={styles.difficultyStarsContainer}>
                            {renderDifficultyStars(difficulty)}
                        </View>
                    </View>
                    
                    {isPrivate && (
                        <View style={styles.lockContainer}>
                            <Icon name="lock" size={14} color="#555" style={styles.lockIcon} />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ===========================================
// STYLES
// ===========================================
const styles = StyleSheet.create({
    cardContainer: {
        width: '48%', 
        marginVertical: 8,
        marginHorizontal: '1%', 
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    recipeImage: {
        width: '100%',
        height: 120, 
        resizeMode: 'cover',
    },
    infoOverlay: {
        padding: 10,
    },
    recipeTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        height: 30, // Đảm bảo đủ chỗ cho 2 dòng
    },
    
    // ⭐ DÒNG STATS (Thời gian & Khẩu phần)
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
    },
    statIcon: {
        marginRight: 3,
        color: '#8BC34A', // Màu xanh lá cho icon
    },
    statText: {
        fontSize: 13,
        color: '#555',
    },
    
    // ⭐ DÒNG ĐỘ KHÓ
    difficultyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
        marginLeft: 40,
    },
    difficultyInfo: { // Container mới để chứa label và stars
        flexDirection: 'row',
        alignItems: 'center',
    },
    difficultyLabel: { // Style cho chữ "Độ khó"
        fontSize: 13,
        color: '#555',
        marginRight: 5, // Khoảng cách giữa chữ "Độ khó" và sao
    },
    difficultyStarsContainer: {
        flexDirection: 'row',
    },
    starIcon: {
        marginRight: 1,
    },
    lockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lockIcon: {
        marginLeft: 5,
    },
    // Đã loại bỏ styles cũ: viewsContainer, recipeViews
});

export default RecipeCard;