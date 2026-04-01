export interface TeamMember {
  id: string;
  name: string;
  title: string | null;
  role: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  order: number;
}
