
export interface ProductCategoryResponseDTO {
  creator?: {
    id: number;
    name: string;
  };
  updater?: {
    id: number;
    name: string;
  } | null;
}

export interface ProductCategoriesListResponseDTO {
  data: ProductCategoryResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
