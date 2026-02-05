import React from 'react';
import { 
    Heart, Utensils, BookOpen, Film, Users, ShoppingCart, 
    Activity, Home, ShoppingBag, Bus, Lightbulb, 
    Briefcase, DollarSign, Wallet, MoreHorizontal,
    Plane, Coffee, Smartphone, Gift, GraduationCap,
    Music, Wifi, Shield
} from 'lucide-react';

export const getIconForCategory = (categoryName) => {
    const name = String(categoryName || '').toLowerCase().trim();
    
    const iconMap = {
        'charity': Heart,
        'donation': Heart,
        'dining out': Utensils,
        'food': Utensils,
        'restaurants': Utensils,
        'education': GraduationCap,
        'books': BookOpen,
        'tuition': BookOpen,
        'entertainment': Film,
        'movies': Film,
        'games': Film,
        'family': Users,
        'kids': Users,
        'groceries': ShoppingCart,
        'market': ShoppingCart,
        'health': Activity,
        'medical': Activity,
        'doctor': Activity,
        'gym': Activity,
        'rent/mortgage': Home,
        'housing': Home,
        'rent': Home,
        'mortgage': Home,
        'shopping': ShoppingBag,
        'clothes': ShoppingBag,
        'clothing': ShoppingBag,
        'transport': Bus,
        'transportation': Bus,
        'car': Bus,
        'fuel': Bus,
        'gas': Bus,
        'utilities': Lightbulb,
        'bills': Lightbulb,
        'electricity': Lightbulb,
        'internet': Wifi,
        'phone': Smartphone,
        'mobile': Smartphone,
        'salary': Briefcase,
        'wages': Briefcase,
        'income': Wallet,
        'freelance': DollarSign,
        'bonus': Gift,
        'travel': Plane,
        'vacation': Plane,
        'coffee': Coffee,
        'music': Music,
        'subscriptions': Music,
        'insurance': Shield,
    };

    const IconComponent = iconMap[name] || MoreHorizontal;
    
    // Return props for render prop or component
    return IconComponent;
};
