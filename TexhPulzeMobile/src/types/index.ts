export type RootStackParamList = {
  Posts: undefined;
  Community: undefined;
  Grievance: undefined;
  CreatePost: undefined;
  PostDetails: { id: number };
  CompaniesList: undefined;
  CompanyProfile: { companyId?: string; companySlug?: string };
  StoryView: { storyId: string };
  Graveyard: undefined;
  DailyBrief: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Companies: undefined;
  Stories: undefined;
  Profile: undefined;
  Settings: undefined;
};
