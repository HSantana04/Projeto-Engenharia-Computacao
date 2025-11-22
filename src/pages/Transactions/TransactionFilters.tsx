import { type FilterCategory, type FilterSubcategory } from './types/index';

interface TransactionFiltersProps {
  searchTerm: string;
  selectedCategory: FilterCategory;
  selectedSubcategory: FilterSubcategory;
  categories: FilterCategory[];
  subcategories: FilterSubcategory[];
  onSearchChange: (searchTerm: string) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onSubcategoryChange: (subcategory: FilterSubcategory) => void;
}

export const TransactionFilters = ({
  searchTerm,
  selectedCategory,
  selectedSubcategory,
  categories,
  subcategories,
  onSearchChange,
  onCategoryChange,
  onSubcategoryChange
}: TransactionFiltersProps) => {
  return (
    <div className="filters">
      <div className="filters__search">
        <input
          type="text"
          placeholder="Buscar por descrição ou categoria..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters__selects">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as FilterCategory)}
          className="filter-select"
        >
          <option value="todas">Todas as categorias</option>
          {categories.filter(cat => cat !== 'todas').map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedSubcategory}
          onChange={(e) => onSubcategoryChange(e.target.value as FilterSubcategory)}
          className="filter-select"
          disabled={selectedCategory === 'todas'}
        >
          <option value="todas">Todas as subcategorias</option>
          {subcategories.filter(sub => sub !== 'todas').map(subcategory => (
            <option key={subcategory} value={subcategory}>{subcategory}</option>
          ))}
        </select>
      </div>
    </div>
  );
};