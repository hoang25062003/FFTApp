import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
export const BRAND_COLOR = '#8BC34A';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    // ========== HEADER SECTION ==========
    headerSection: {
        marginBottom: 20,
        backgroundColor: '#F8F9FA',
    },

    headerBackground: {
        height: 160,
        backgroundColor: BRAND_COLOR,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
    },

    decorativeCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -40,
    },

    decorativeCircle2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -20,
        left: -20,
    },

    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 1,
    },

    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        marginBottom: 4,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },

    // ========== SEARCH CARD ==========
    searchCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: -40,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 24,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },

    // ========== SELECTED INGREDIENTS CHIPS ==========
    selectedIngredientsContainer: {
        marginTop: 12,
    },

    chipsScrollContent: {
        gap: 8,
        paddingRight: 16,
    },

    selectedIngredientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: BRAND_COLOR,
    },

    selectedIngredientText: {
        fontSize: 14,
        fontWeight: '600',
        color: BRAND_COLOR,
    },

    // ========== SECTION ==========
    section: {
        marginBottom: 24,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 10,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
    },

    // ✅ NÚT XEM TẤT CẢ
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        gap: 4,
    },

    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: BRAND_COLOR,
    },

    // ========== INGREDIENT CARDS (RECENT CARDS) ==========
    horizontalScrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },

    recentCard: {
        width: width * 0.35,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
        marginBottom: 5,
        position: 'relative',
    },

    // ✅ BADGE CHECKMARK CHO NGUYÊN LIỆU ĐƯỢC CHỌN
    selectedBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    recentCardImage: {
        width: '100%',
        height: 80,
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    newBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },

    newBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },

    recentCardText: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 4,
    },

    categoryText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
        textAlign: 'center',
    },

    // ========== DISH CARD ==========
    dishCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },

    dishHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },

    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },

    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },

    difficultyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },

    difficultyText: {
        fontSize: 12,
        fontWeight: '700',
    },

    moreButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    dishTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        lineHeight: 24,
    },

    dishImageContainer: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },

    dishImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ========== DISH INFO GRID ==========
    dishInfoGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },

    infoCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
    },

    infoIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },

    infoValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
    },

    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ========== DISH ACTIONS ==========
    dishActions: {
        flexDirection: 'row',
        gap: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },

    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        gap: 6,
    },

    actionIconBg: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    actionText: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '700',
    },

    primaryActionButton: {
        backgroundColor: BRAND_COLOR,
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    primaryActionText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default styles;