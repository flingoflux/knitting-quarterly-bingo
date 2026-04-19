export interface BoardCellData {
  title: string;
  cat: string;
  catKey: string;
}

export interface BoardTransferState {
  projects: BoardCellData[];
}
