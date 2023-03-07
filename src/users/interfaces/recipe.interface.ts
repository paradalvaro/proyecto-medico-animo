export interface CompleteForm {
  recipes?: Recipes;
  dream?: DataYear<number>;
  mania_irritable?: DataYear<boolean>;
  mania?: DataYear<string>;
  depresion?: DataYear<string>;
  cambios_animo?: DataYear<number>;
  peso?: DataYear<string>;
  menstruacion?: DataYear<boolean>;
}
export interface Recipes {
  [id: string]: Recipe;
}
export interface Recipe {
  nameMed: string;
  dosis: string;
  cant: number;
  isActive: boolean;
  dataYear?: DataYear<number>;
}

export interface DataYear<T> {
  [year: number]: DataMonth<T>;
}

export interface DataMonth<T> {
  [month: number]: DataDays<T>;
}
export interface DataDays<T> {
  [day: number]: T;
}
