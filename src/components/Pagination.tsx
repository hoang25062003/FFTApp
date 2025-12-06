// src/components/Pagination.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PaginationProps {
    currentPage: number; // Trang hiện tại (bắt đầu từ 1)
    totalPages: number; // Tổng số trang
    pageSize: number; // Số items mỗi trang
    totalItems: number; // Tổng số items
    onPageChange: (page: number) => void; // Callback khi đổi trang
    onPageSizeChange?: (pageSize: number) => void; // Callback khi đổi page size (optional)
    pageSizeOptions?: number[]; // Các tùy chọn page size (mặc định: [10, 20, 50])
    showPageSizeSelector?: boolean; // Hiển thị selector page size không (mặc định: true)
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    showPageSizeSelector = true,
}) => {
    // Tính toán range hiển thị
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Xử lý chuyển trang
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handleFirst = () => {
        if (currentPage !== 1) {
            onPageChange(1);
        }
    };

    const handleLast = () => {
        if (currentPage !== totalPages) {
            onPageChange(totalPages);
        }
    };

    // Render các nút số trang (hiển thị tối đa 5 nút)
    const renderPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages.map((page) => (
            <TouchableOpacity
                key={page}
                style={[
                    styles.pageButton,
                    currentPage === page && styles.pageButtonActive,
                ]}
                onPress={() => onPageChange(page)}
                disabled={currentPage === page}
            >
                <Text
                    style={[
                        styles.pageButtonText,
                        currentPage === page && styles.pageButtonTextActive,
                    ]}
                >
                    {page}
                </Text>
            </TouchableOpacity>
        ));
    };

    return (
        <View style={styles.container}>
            {/* Page Size Selector */}
            {showPageSizeSelector && onPageSizeChange && (
                <View style={styles.pageSizeContainer}>
                    <Text style={styles.pageSizeLabel}>Hiển thị:</Text>
                    {pageSizeOptions.map((size) => (
                        <TouchableOpacity
                            key={size}
                            style={[
                                styles.pageSizeButton,
                                pageSize === size && styles.pageSizeButtonActive,
                            ]}
                            onPress={() => onPageSizeChange(size)}
                        >
                            <Text
                                style={[
                                    styles.pageSizeButtonText,
                                    pageSize === size && styles.pageSizeButtonTextActive,
                                ]}
                            >
                                {size}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.pageSizeLabel}>/ trang</Text>
                </View>
            )}

            {/* Pagination Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    Hiển thị {startItem}-{endItem} trong tổng số {totalItems}
                </Text>
            </View>

            {/* Pagination Controls */}
            <View style={styles.controlsContainer}>
                {/* First Page Button */}
                <TouchableOpacity
                    style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
                    onPress={handleFirst}
                    disabled={currentPage === 1}
                >
                    <Icon
                        name="page-first"
                        size={20}
                        color={currentPage === 1 ? '#ccc' : '#8BC34A'}
                    />
                </TouchableOpacity>

                {/* Previous Button */}
                <TouchableOpacity
                    style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
                    onPress={handlePrevious}
                    disabled={currentPage === 1}
                >
                    <Icon
                        name="chevron-left"
                        size={24}
                        color={currentPage === 1 ? '#ccc' : '#8BC34A'}
                    />
                </TouchableOpacity>

                {/* Page Numbers */}
                <View style={styles.pageNumbersContainer}>
                    {renderPageNumbers()}
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        currentPage === totalPages && styles.navButtonDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={currentPage === totalPages}
                >
                    <Icon
                        name="chevron-right"
                        size={24}
                        color={currentPage === totalPages ? '#ccc' : '#8BC34A'}
                    />
                </TouchableOpacity>

                {/* Last Page Button */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        currentPage === totalPages && styles.navButtonDisabled,
                    ]}
                    onPress={handleLast}
                    disabled={currentPage === totalPages}
                >
                    <Icon
                        name="page-last"
                        size={20}
                        color={currentPage === totalPages ? '#ccc' : '#8BC34A'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    
    // Page Size Selector
    pageSizeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    pageSizeLabel: {
        fontSize: 14,
        color: '#555',
        marginHorizontal: 5,
    },
    pageSizeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    pageSizeButtonActive: {
        backgroundColor: '#8BC34A',
        borderColor: '#8BC34A',
    },
    pageSizeButtonText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },
    pageSizeButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    
    // Info
    infoContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
    },
    
    // Controls
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButton: {
        padding: 8,
        marginHorizontal: 2,
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
    },
    navButtonDisabled: {
        backgroundColor: '#f9f9f9',
    },
    
    // Page Numbers
    pageNumbersContainer: {
        flexDirection: 'row',
        marginHorizontal: 5,
    },
    pageButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 2,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        minWidth: 35,
        alignItems: 'center',
    },
    pageButtonActive: {
        backgroundColor: '#8BC34A',
        borderColor: '#8BC34A',
    },
    pageButtonText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    pageButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Pagination;