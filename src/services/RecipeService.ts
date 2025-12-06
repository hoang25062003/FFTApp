import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CACHE_TTL = 5 * 60 * 1000;

// ============================================
// TYPES
// ============================================

export interface IngredientName {
  id: string;
  name: string;
}

export interface Label {
  id: string;
  name: string;
  colorCode: string;
}

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface MyRecipe {
  id: string;
  name: string;
  description: string;
  difficulty: {
    name: string;
    value: number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  labels: Label[];
  ingredients: IngredientName[];
  createdAtUtc?: string;
  updatedAtUtc?: string;
  author?: Author;
  rating?: number;
  averageRating?: number;
  numberOfRatings?: number;
}

export interface MyRecipeResponse {
  items: MyRecipe[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface RecipeIngredient {
  id?: string;
  ingredientId?: string;
  name: string;
  quantityGram: number;
}

export interface RecipeLabel {
  id: string;
  name: string;
  colorCode: string;
}

export interface CookingStepImageDetail {
  id: string;
  imageId: string;
  imageUrl?: string;
  imageOrder: number;
}

export interface CookingStepDetail {
  id: string;
  stepOrder: number;
  instruction: string;
  cookingStepImages: CookingStepImageDetail[];
  imageUrl?: string;
}

export interface RecipeParent {
  id: string;
  name: string;
}

export interface RecipeDetail {
  id: string;
  name: string;
  description: string;
  difficulty: {
    name?: string;
    value: string | number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  labels: RecipeLabel[];
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStepDetail[];
  taggedUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatar?: {
      imageUrl?: string;
    };
  }>;
  taggedUser?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  createdBy?: {
    id: string;
    userName: string;
    avatarUrl?: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  isFavorited?: boolean;
  isSaved?: boolean;
  rating?: number;
  averageRating?: number;
  numberOfRatings?: number;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  createdAt?: string;
  updatedAt?: string;
  parent?: RecipeParent;
}

export type RecipeIngredientPayload = {
  ingredientId: string;
  quantityGram: number;
};

export type CookingStepImage = {
  id?: string;
  image?: string;
  imageOrder: number;
};

export type CookingStep = {
  instruction: string;
  stepOrder: number;
  images: CookingStepImage[];
};

export type CreateRecipePayload = {
  name: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  image?: string;
  ration: number;
  labelIds?: string[];
  ingredients?: RecipeIngredientPayload[];
  cookingSteps?: CookingStep[];
  taggedUserIds?: string[];
};

export type RecipeFilterParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  difficulty?: string;
  labelId?: string;
  sortBy?: 'newest' | 'popular' | 'rating';
};

export type MyRecipesParams = {
  page?: number;
  pageSize?: number;
  title?: string;
};

// NEW: Advanced search params
export interface RecipeSearchParams {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
  difficulty?: string;
  sortBy?: string;
  ration?: number;
  maxCookTime?: number;
  labelIds?: string[];
  ingredientIds?: string[];
}

// NEW: Rating response type
export interface RatingResponse {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  isOwner?: boolean;
}

export interface PaginatedRatingResponse {
  items: RatingResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// ============================================
// UTILITIES
// ============================================

const validateRating = (rating: number): void => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }
};

const validateRecipePayload = (
  data: CreateRecipePayload | Partial<CreateRecipePayload>,
  isUpdate: boolean = false
): void => {
  if (!isUpdate && !data.name) {
    throw new Error('Recipe name is required');
  }
  if (!isUpdate && !data.difficulty) {
    throw new Error('Difficulty is required');
  }
  if (data.cookTime !== undefined && data.cookTime < 0) {
    throw new Error('Cook time must be non-negative');
  }
  if (data.ration !== undefined && data.ration < 1) {
    throw new Error('Ration must be at least 1');
  }
};

const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([^./?#]+)(?:[?#]|$)/i);
  return match ? match[1] : 'jpg';
};

const getMimeType = (uri: string): string => {
  const ext = getFileExtension(uri).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
};

const buildRecipeFormData = async (
  data: Partial<CreateRecipePayload>,
  isUpdate: boolean = false
): Promise<FormData> => {
  const formData = new FormData();

  if (data.name) formData.append('Name', data.name);
  formData.append('Difficulty', data.difficulty || 'EASY');
  formData.append('Ration', String(Math.floor(data.ration || 1)));
  if (data.description) formData.append('Description', data.description);
  formData.append('CookTime', String(data.cookTime || 0));

  if (data.image) {
    const uri = data.image;
    const filename = uri.split('/').pop() || `recipe_image.${getFileExtension(uri)}`;
    const type = getMimeType(uri);
    formData.append('Image', { uri, name: filename, type } as any);
  }

  if (data.labelIds && data.labelIds.length > 0) {
    data.labelIds.forEach((labelId) => formData.append('LabelIds', labelId));
  }

  if (data.ingredients && data.ingredients.length > 0) {
    data.ingredients.forEach((ingredient, index) => {
      formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
      formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
    });
  }

  if (data.cookingSteps && data.cookingSteps.length > 0) {
    data.cookingSteps.forEach((step, stepIndex) => {
      formData.append(`CookingSteps[${stepIndex}].StepOrder`, String(step.stepOrder));
      formData.append(`CookingSteps[${stepIndex}].Instruction`, step.instruction);
      if (step.images && step.images.length > 0) {
        step.images.forEach((img, imgIndex) => {
          if (img.image) {
            // New image
            const uri = img.image;
            const filename =
              uri.split('/').pop() || `step_${stepIndex}_img_${imgIndex}.${getFileExtension(uri)}`;
            const type = getMimeType(uri);
            formData.append(
              `CookingSteps[${stepIndex}].Images[${imgIndex}].Image`,
              { uri, name: filename, type } as any
            );
            formData.append(
              `CookingSteps[${stepIndex}].Images[${imgIndex}].ImageOrder`,
              String(img.imageOrder)
            );
          } else if (isUpdate && img.id) {
            // Existing image for update
            formData.append(
              `CookingSteps[${stepIndex}].Images[${imgIndex}].ExistingImageId`,
              img.id
            );
            formData.append(
              `CookingSteps[${stepIndex}].Images[${imgIndex}].ImageOrder`,
              String(img.imageOrder)
            );
          }
        });
      }
    });
  }

  if (data.taggedUserIds && data.taggedUserIds.length > 0) {
    data.taggedUserIds.forEach((userId, index) => {
      formData.append(`TaggedUserIds[${index}].UserId`, userId);
    });
  }

  return formData;
};

const buildQueryParams = (params: Record<string, any>): URLSearchParams => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          queryParams.append(`${key}[${index}]`, item.toString());
        });
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });
  return queryParams;
};

// ============================================
// CACHE
// ============================================

class RecipeCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = CACHE_TTL) {
    this.ttl = ttl;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const recipeCache = new RecipeCache();

// ============================================
// HTTP CLIENT
// ============================================

class RecipeHttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408);
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (includeAuth) {
      const token = await TokenManager.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await this.fetchWithTimeout(url, { ...options, headers });

      if (response.status === 204) return {} as T;

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw this.handleError(response, responseData);
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      const message = error instanceof Error ? error.message : 'Lỗi kết nối mạng.';
      throw new ApiException(message, 0);
    }
  }

  private handleError(response: Response, responseData: any): ApiException {
    const errorData = responseData as any;
    let errorMessage = errorData.message || `Lỗi ${response.status}: ${response.statusText}`;

    if (errorData.errors) {
      const details = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('\n');
      errorMessage = `Dữ liệu không hợp lệ:\n${details}`;
    }

    return new ApiException(errorMessage, response.status, errorData.errors);
  }
}

const recipeHttpClient = new RecipeHttpClient(BASE_URL);

// ============================================
// API METHODS
// ============================================

// ========== CORE RECIPE CRUD ==========

export async function createRecipe(data: CreateRecipePayload): Promise<RecipeDetail> {
  validateRecipePayload(data);
  const formData = await buildRecipeFormData(data);
  const recipe = await recipeHttpClient.request<RecipeDetail>(
    '/Recipe',
    { method: 'POST', body: formData },
    true
  );
  recipeCache.invalidate('recipes');
  recipeCache.invalidate('myRecipes');
  return recipe;
}

export async function getRecipes(params?: RecipeFilterParams): Promise<MyRecipeResponse> {
  const cacheKey = `recipes_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    'PaginationParams.PageNumber': params?.page || 1,
    'PaginationParams.PageSize': params?.pageSize || 10,
    search: params?.search,
    difficulty: params?.difficulty,
    labelId: params?.labelId,
    sortBy: params?.sortBy,
  });

  const endpoint = queryParams.toString() ? `/Recipe?${queryParams.toString()}` : '/Recipe';
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, false);
  recipeCache.set(cacheKey, result);
  return result;
}

export async function getRecipeById(recipeId: string): Promise<RecipeDetail> {
  if (!recipeId) throw new Error('Recipe ID is required');
  const cacheKey = `recipe_${recipeId}`;
  const cached = recipeCache.get<RecipeDetail>(cacheKey);
  if (cached) return cached;

  const recipe = await recipeHttpClient.request<RecipeDetail>(
    `/Recipe/${recipeId}`,
    { method: 'GET' },
    true
  );
  recipeCache.set(cacheKey, recipe);
  return recipe;
}

export async function getMyRecipes(params?: MyRecipesParams): Promise<MyRecipeResponse> {
  const cacheKey = `myRecipes_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    PageNumber: params?.page,
    PageSize: params?.pageSize,
    Title: params?.title,
  });

  const endpoint = queryParams.toString() ? `/Recipe/myRecipe?${queryParams.toString()}` : '/Recipe/myRecipe';
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, true);
  recipeCache.set(cacheKey, result);
  return result;
}

export async function updateRecipe(
  recipeId: string,
  data: Partial<CreateRecipePayload>
): Promise<RecipeDetail> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateRecipePayload(data, true);
  const formData = await buildRecipeFormData(data, true);
  const recipe = await recipeHttpClient.request<RecipeDetail>(
    `/Recipe/${recipeId}`,
    { method: 'PUT', body: formData },
    true
  );
  recipeCache.invalidate(`recipe_${recipeId}`);
  recipeCache.invalidate('recipes');
  recipeCache.invalidate('myRecipes');
  return recipe;
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  await recipeHttpClient.request<void>(`/Recipe/${recipeId}`, { method: 'DELETE' }, true);
  recipeCache.invalidate(`recipe_${recipeId}`);
  recipeCache.invalidate('recipes');
  recipeCache.invalidate('myRecipes');
}

// ========== NEW: USER RECIPES ==========

export async function getRecipesByUserName(
  userName: string,
  params?: { pageNumber?: number; pageSize?: number }
): Promise<MyRecipeResponse> {
  if (!userName) throw new Error('Username is required');
  
  const cacheKey = `userRecipes_${userName}_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 12,
  });

  const endpoint = `/Recipe/user/${userName}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, false);
  recipeCache.set(cacheKey, result);
  return result;
}

// ========== NEW: FAVORITE RECIPES ==========

export async function getFavoriteRecipes(params?: {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<MyRecipeResponse> {
  const cacheKey = `favoriteRecipes_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 10,
    ...(params?.keyword && { Keyword: params.keyword }),
  });

  const endpoint = `/recipe/favorites?${queryParams.toString()}`;
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, true);
  recipeCache.set(cacheKey, result);
  return result;
}

export async function addToFavorite(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  await recipeHttpClient.request<void>(`/Recipe/${recipeId}/favorite`, { method: 'POST' }, true);
  recipeCache.invalidate(`recipe_${recipeId}`);
  recipeCache.invalidate('favoriteRecipes');
}

export async function removeFromFavorite(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  await recipeHttpClient.request<void>(`/Recipe/${recipeId}/favorite`, { method: 'DELETE' }, true);
  recipeCache.invalidate(`recipe_${recipeId}`);
  recipeCache.invalidate('favoriteRecipes');
}

// ========== NEW: SAVED RECIPES ==========

export async function getSavedRecipes(params?: {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<MyRecipeResponse> {
  const cacheKey = `savedRecipes_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 10,
    ...(params?.keyword && { Keyword: params.keyword }),
  });

  const endpoint = `/recipe/saved?${queryParams.toString()}`;
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, true);
  recipeCache.set(cacheKey, result);
  return result;
}

export async function saveRecipe(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  await recipeHttpClient.request<void>(`/Recipe/${recipeId}/save`, { method: 'POST' }, true);
  recipeCache.invalidate(`recipe_${recipeId}`);
  recipeCache.invalidate('savedRecipes');
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  await recipeHttpClient.request<void>(`/Recipe/${recipeId}/save`, { method: 'DELETE' }, true);
  recipeCache.invalidate(`recipe_${recipeId}`);
  recipeCache.invalidate('savedRecipes');
}

// ========== NEW: RECIPE HISTORY ==========

export async function getHistory(params?: {
  pageNumber?: number;
  pageSize?: number;
}): Promise<MyRecipeResponse> {
  const cacheKey = `history_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 10,
  });

  const endpoint = `/Recipe/history?${queryParams.toString()}`;
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, true);
  recipeCache.set(cacheKey, result);
  return result;
}

// ========== NEW: ADVANCED SEARCH ==========

export async function searchRecipes(params?: RecipeSearchParams): Promise<MyRecipeResponse> {
  const cacheKey = `search_${JSON.stringify(params)}`;
  const cached = recipeCache.get<MyRecipeResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryParams({
    Keyword: params?.keyword || '',
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 10,
    ...(params?.difficulty && { Difficulty: params.difficulty }),
    ...(params?.sortBy && { SortBy: params.sortBy }),
    ...(params?.ration !== undefined && { Ration: params.ration }),
    ...(params?.maxCookTime !== undefined && { MaxCookTime: params.maxCookTime }),
  });

  // Add array params
  if (params?.labelIds && params.labelIds.length > 0) {
    params.labelIds.forEach((id, index) => {
      queryParams.append(`LabelIds[${index}]`, id);
    });
  }

  if (params?.ingredientIds && params.ingredientIds.length > 0) {
    params.ingredientIds.forEach((id, index) => {
      queryParams.append(`IngredientIds[${index}]`, id);
    });
  }

  const endpoint = `/Recipe?${queryParams.toString()}`;
  const result = await recipeHttpClient.request<MyRecipeResponse>(endpoint, { method: 'GET' }, false);
  recipeCache.set(cacheKey, result);
  return result;
}

// ========== RATING ==========

export async function rateRecipe(recipeId: string, rating: number): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  validateRating(rating);
  await recipeHttpClient.request<void>(
    `/Rating/${recipeId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    },
    true
  );
  recipeCache.invalidate(`recipe_${recipeId}`);
}

export async function deleteRating(recipeId: string): Promise<void> {
  if (!recipeId) throw new Error('Recipe ID is required');
  await recipeHttpClient.request<void>(`/Rating/${recipeId}`, { method: 'DELETE' }, true);
  recipeCache.invalidate(`recipe_${recipeId}`);
}

// ========== NEW: RECIPE RATINGS & FEEDBACK ==========

export async function getRecipeRatings(
  recipeId: string,
  params?: { pageNumber?: number; pageSize?: number }
): Promise<PaginatedRatingResponse> {
  if (!recipeId) throw new Error('Recipe ID is required');

  const queryParams = buildQueryParams({
    PageNumber: params?.pageNumber || 1,
    PageSize: params?.pageSize || 10,
  });

  const endpoint = `/Recipe/${recipeId}/rating?${queryParams.toString()}`;
  return await recipeHttpClient.request<PaginatedRatingResponse>(endpoint, { method: 'GET' }, true);
}

// ========== NEW: COPY RECIPE ==========

export async function copyRecipe(
  parentId: string,
  data: CreateRecipePayload
): Promise<void> {
  if (!parentId) throw new Error('Parent recipe ID is required');
  validateRecipePayload(data);
  
  const formData = await buildRecipeFormData(data);
  
  await recipeHttpClient.request<void>(
    `/Recipe/${parentId}/copy`,
    { method: 'POST', body: formData },
    true
  );
  
  recipeCache.invalidate('recipes');
  recipeCache.invalidate('myRecipes');
}

// ========== CACHE MANAGEMENT ==========

export function clearRecipeCache(): void {
  recipeCache.clear();
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Core CRUD
  createRecipe,
  getRecipes,
  getRecipeById,
  getMyRecipes,
  updateRecipe,
  deleteRecipe,
  
  // User Recipes
  getRecipesByUserName,
  
  // Favorites
  getFavoriteRecipes,
  addToFavorite,
  removeFromFavorite,
  
  // Saved
  getSavedRecipes,
  saveRecipe,
  unsaveRecipe,
  
  // History
  getHistory,
  
  // Search
  searchRecipes,
  
  // Rating
  rateRecipe,
  deleteRating,
  getRecipeRatings,
  
  // Copy
  copyRecipe,
  
  // Cache
  clearRecipeCache,
};