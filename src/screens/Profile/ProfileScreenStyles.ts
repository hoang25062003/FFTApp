// ProfileScreenStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BRAND_COLOR = '#8BC34A';

export const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    retryButton: {
        backgroundColor: BRAND_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    headerSection: {
        marginBottom: 20,
    },
    gradientBg: {
        height: 180,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    patternOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    
    profileHeader: {
        marginTop: -80,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    avatarSection: {
        marginBottom: 16,
    },
    avatarWrapper: {
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFF',
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: BRAND_COLOR,
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    profileBio: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 20,
    },
    
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: BRAND_COLOR,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    shareButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: BRAND_COLOR,
    },
    shareButtonText: {
        color: BRAND_COLOR,
        fontWeight: '700',
        fontSize: 15,
    },
    logoutButton: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FEE2E2',
    },
    
    contentSection: {
        paddingHorizontal: 20,
    },
    
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
        maxWidth: '60%',
        textAlign: 'right',
    },
    
    recipeSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    recipeSectionHeader: {
        marginBottom: 16,
    },
    recipeTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    recipeSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    recipeBadge: {
        backgroundColor: BRAND_COLOR,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 32,
        alignItems: 'center',
    },
    recipeBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#1F2937',
        fontSize: 14,
        fontWeight: '500',
    },
    
    recipesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

export const BRAND_COLOR_EXPORT = BRAND_COLOR;