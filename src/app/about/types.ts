export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  order: number;
}
