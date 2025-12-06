import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { ReactNode } from 'react';

interface InputProps extends Omit<React.ComponentProps<typeof TextInput>, 'style'> {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    isPassword?: boolean;
    iconRight?: ReactNode;
    style?: any; 
    editable?: boolean;
    maxLength?: number;
    // Props mới cho dropdown
    isDropdown?: boolean;
    dropdownOptions?: string[];
    onSelectOption?: (option: string) => void;
}

const CustomInput: React.FC<InputProps> = ({
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    secureTextEntry = false,
    isPassword = false,
    iconRight,
    style,
    editable = true,
    isDropdown = false,
    dropdownOptions = [],
    onSelectOption,
    ...rest
}) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const [showDropdown, setShowDropdown] = useState(false);

    // Xác định icon sẽ hiển thị
    let rightIcon = null;

    if (isPassword) {
        rightIcon = (
            <TouchableOpacity
                style={styles.rightIconWrapper}
                onPress={() => setIsSecure(!isSecure)}
            >
                <Icon
                    name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textSecondary}
                />
            </TouchableOpacity>
        );
    } else if (isDropdown) {
        rightIcon = (
            <View style={styles.rightIconWrapper}>
                <Icon
                    name="chevron-down"
                    size={20}
                    color={Colors.textSecondary}
                />
            </View>
        );
    } else if (iconRight) {
        rightIcon = (
            <View style={styles.rightIconWrapper}>
                {iconRight}
            </View>
        );
    }

    const handleDropdownPress = () => {
        if (isDropdown) {
            setShowDropdown(true);
        }
    };

    const handleSelectOption = (option: string) => {
        if (onSelectOption) {
            onSelectOption(option);
        }
        setShowDropdown(false);
    };

    // Nếu là dropdown, render như một TouchableOpacity
    if (isDropdown) {
        return (
            <>
                <TouchableOpacity 
                    style={[styles.container, style]}
                    onPress={handleDropdownPress}
                    activeOpacity={0.7}
                >
                    <Text style={value ? styles.selectedText : styles.placeholderText}>
                        {value || placeholder}
                    </Text>
                    {rightIcon}
                </TouchableOpacity>

                <Modal
                    visible={showDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowDropdown(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{placeholder}</Text>
                            {dropdownOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.modalOption,
                                        index === dropdownOptions.length - 1 && styles.lastOption
                                    ]}
                                    onPress={() => handleSelectOption(option)}
                                >
                                    <Text style={styles.modalOptionText}>{option}</Text>
                                    {value === option && (
                                        <Icon name="checkmark" size={20} color="#8BC34A" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </>
        );
    }

    // Render bình thường cho TextInput
    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={isSecure}
                placeholderTextColor={Colors.textSecondary}
                editable={editable}
                {...rest}
            />
            {!!rightIcon && rightIcon}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 20,
        height: 50,
        backgroundColor: Colors.white,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    rightIconWrapper: {
        paddingLeft: 10,
        justifyContent: 'center',
        height: '100%',
    },
    // Styles cho dropdown
    selectedText: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    placeholderText: {
        flex: 1,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
});

export default CustomInput;