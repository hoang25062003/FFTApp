import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native'; // Dùng để quản lý nút back

// Component cho phần nhập thông tin chung và nguyên liệu
const InputSection: React.FC<{ title: string; hint: string; children?: React.ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionHint}>{hint}</Text>
    {children}
  </View>
);

// Component cho một bước nấu ăn
interface CookingStep {
  id: number;
  description: string;
  image: string | null;
}

const CookingStepComponent: React.FC<{
  step: CookingStep;
  index: number;
  onRemove: (id: number) => void;
  onDescriptionChange: (id: number, text: string) => void;
  // Giả định có hàm xử lý thêm ảnh
  onAddImage: (id: number) => void;
}> = ({ step, index, onRemove, onDescriptionChange, onAddImage }) => (
  <View style={styles.stepContainer}>
    <View style={styles.stepHeader}>
      <Text style={styles.stepTitle}>Bước {index + 1}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(step.id)}
      >
        <Text style={styles.removeButtonText}>Xóa bước</Text>
      </TouchableOpacity>
    </View>
    <TextInput
      style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
      placeholder="Mô tả chi tiết bước làm..."
      multiline
      value={step.description}
      onChangeText={(text) => onDescriptionChange(step.id, text)}
    />
    <TouchableOpacity style={styles.addImageButton} onPress={() => onAddImage(step.id)}>
      <Icon name="image-outline" size={24} color="#555" />
      <Text style={styles.addImageText}>Thêm ảnh</Text>
    </TouchableOpacity>
  </View>
);

const AddScreen: React.FC = () => {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [steps, setSteps] = useState<CookingStep[]>([
    { id: 1, description: '', image: null },
    { id: 2, description: '', image: null },
  ]);

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleAddStep = () => {
    const newId = steps.length > 0 ? steps[steps.length - 1].id + 1 : 1;
    setSteps([...steps, { id: newId, description: '', image: null }]);
  };

  const handleRemoveStep = (id: number) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleStepDescriptionChange = (id: number, text: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, description: text } : step))
    );
  };

  // Giả lập hàm thêm ảnh
  const handleAddImageToStep = (id: number) => {
    console.log(`Thêm ảnh cho bước ID: ${id}`);
    // Thực tế sẽ là mở thư viện ảnh hoặc camera
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo công thức món ăn</Text>
        <View style={styles.backButton} /> {/* Placeholder để căn giữa */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. Hình ảnh món ăn */}
        <InputSection title="Hình ảnh món ăn" hint="Tải ảnh của bạn lên, ảnh chấp nhận định dạng PNG hoặc JPG.">
          <TouchableOpacity style={styles.imagePlaceholder}>
            <Icon name="camera-outline" size={40} color="#ccc" style={{marginBottom: 5}}/>
            <Text style={styles.chooseImageText}>Chọn hình ảnh</Text>
          </TouchableOpacity>
        </InputSection>

        {/* 2. Thông tin món ăn */}
        <InputSection title="Thông tin món ăn" hint="">
          <TextInput style={styles.inputField} placeholder="Tên món ăn" />
          <TextInput style={styles.inputField} placeholder="Thời gian nấu" />
          <TextInput
            style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Mô tả món ăn"
            multiline
          />
        </InputSection>

        {/* 3. Nguyên liệu */}
        <InputSection title="Nguyên liệu" hint="">
          {ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientTag}>
              <Text style={styles.ingredientText}>{item}</Text>
              <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, i) => i !== index))}>
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.inputField, { flex: 1, marginBottom: 0 }]}
              placeholder="Thêm nguyên liệu mới"
              value={newIngredient}
              onChangeText={setNewIngredient}
              onSubmitEditing={handleAddIngredient}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </InputSection>

        {/* 4. Nhãn/Tags */}
        <InputSection title="Nhãn" hint="">
          <TextInput style={styles.inputField} placeholder="Thêm nhãn..." />
        </InputSection>

        {/* 5. Hướng dẫn nấu */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hướng dẫn nấu</Text>
          
          {steps.map((step, index) => (
            <CookingStepComponent
              key={step.id}
              step={step}
              index={index}
              onRemove={handleRemoveStep}
              onDescriptionChange={handleStepDescriptionChange}
              onAddImage={handleAddImageToStep}
            />
          ))}

          <TouchableOpacity style={styles.addStepButton} onPress={handleAddStep}>
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.addStepButtonText}>Thêm bước làm</Text>
          </TouchableOpacity>
        </View>

        {/* Padding cuối cùng */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Footer / Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>Đăng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Nền màu xám nhạt
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionHint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  imagePlaceholder: {
    height: 120,
    width: 120,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  chooseImageText: {
    fontSize: 14,
    color: '#555',
  },
  inputField: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#8BC34A', // Màu xanh lá cây
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    height: 45,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A5D6A7', // Màu xanh lá nhạt hơn
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  ingredientText: {
    color: '#333',
    marginRight: 5,
    fontSize: 14,
  },
  stepContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fcfcfc',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#E57373', // Màu đỏ nhạt
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addImageButton: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 10,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addImageText: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
  addStepButton: {
    flexDirection: 'row',
    backgroundColor: '#8BC34A', // Màu xanh lá cây
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addStepButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#8BC34A', // Màu xanh lá cây
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddScreen;