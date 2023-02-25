export interface Recipes {
  [id: string]: Recipe;
}

export interface Recipe {
  nameMed: string;
  dosis: string;
  cant: number;
  isActive: boolean;
  dataYear?: dataYear;
}

export interface dataYear {
  [year: number]: dataMonth;
}

export interface dataMonth {
  [month: number]: dataDays;
}

export interface dataDays {
  [day: number]: number;
}
