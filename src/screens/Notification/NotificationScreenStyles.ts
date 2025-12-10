import { StyleSheet } from 'react-native';

const BRAND_COLOR = '#8BC34A';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    innerContainer: {
        flex: 1,
    },

    // --- Header Section (giống CreateRecipeScreen) ---
    headerSection: { 
        marginBottom: 0 
    },
    headerBackground: {
        height: 140,
        backgroundColor: BRAND_COLOR,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        paddingBottom: 20,
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
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: '500',
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    headerBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: BRAND_COLOR,
    },
    headerBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },

    // --- Action Bar ---
    actionBar: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    markAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: BRAND_COLOR,
    },

    // --- Notification Items ---
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    unreadBg: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },

    // --- Avatar ---
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatarBase: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: BRAND_COLOR,
    },
    badgeCount: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        minWidth: 24,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },

    // --- Content ---
    contentContainer: {
        flex: 1,
    },
    messageText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 6,
    },
    unreadTextBold: {
        fontWeight: '600',
        color: '#1F2937',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    // --- Unread Indicator ---
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: BRAND_COLOR,
        marginLeft: 8,
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },

    // --- Loading State ---
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    // --- Empty State ---
    emptyListContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});