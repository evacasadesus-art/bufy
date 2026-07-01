export type Difficulty = 'Exprés' | 'Fácil' | 'Media';
export type DayKey = 'L' | 'M' | 'X' | 'J' | 'V';
export type MealType = 'comida' | 'cena';

export interface Recipe {
  id: string;
  name: string;
  time: number;
  persons: number;
  difficulty: Difficulty;
  ingredients: string[];
  steps: string[];
}

export interface DayMenu {
  day: DayKey;
  fullName: string;
  comida: Recipe;
  cena: Recipe;
}

export type WeekMenu = DayMenu[];

export type RootStackParamList = {
  MenuHome: undefined;
  RecipeDetail: {
    recipe: Recipe;
    dayName: string;
  };
};

export type RootTabParamList = {
  Menú: undefined;
  Nevera: undefined;
  Compra: undefined;
  Monedero: undefined;
  Perfil: undefined;
};
