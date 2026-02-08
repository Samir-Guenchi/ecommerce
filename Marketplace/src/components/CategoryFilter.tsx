import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/marketplace.api';
import './CategoryFilter.css';

interface CategoryFilterProps {
    onSelectCategory: (category: string) => void;
    selectedCategory?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    onSelectCategory,
    selectedCategory,
}) => {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Category icons mapping
    const categoryIcons: { [key: string]: string } = {
        'Décoration': '🏺',
        'Artisanat': '🎨',
        'Bijoux': '💍',
        'Vêtements': '👗',
        'Cuisine': '🍽️',
        'Chaussures': '👟',
        'Accessoires': '👜',
        'Livres': '📚',
        'Électronique': '💻',
    };

    if (loading) {
        return <div className="category-filter-loading">Chargement...</div>;
    }

    return (
        <div className="category-filter">
            {categories.map((category) => (
                <button
                    key={category}
                    className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => onSelectCategory(category)}
                >
                    <span className="category-icon">
                        {categoryIcons[category] || '📦'}
                    </span>
                    <span className="category-label">{category}</span>
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
