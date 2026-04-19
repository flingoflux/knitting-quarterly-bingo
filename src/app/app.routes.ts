export const routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/bingo/bingo.component').then(m => m.BingoComponent)
  }
];
