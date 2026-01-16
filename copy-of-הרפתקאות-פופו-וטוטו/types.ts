
export interface StoryPage {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface Story {
  title: string;
  pages: StoryPage[];
}

export enum AppState {
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  READING = 'READING'
}
