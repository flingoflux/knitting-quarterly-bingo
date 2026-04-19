export const routes = [
  {
    path: '',
    loadComponent: () => import('./features/bingo/start.page').then((m) => m.BingoStartPageComponent),
  },
  {
    path: 'board',
    loadComponent: () => import('./features/bingo/bingo.component').then((m) => m.BingoComponent),
  },
];
