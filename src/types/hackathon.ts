export interface ProblemStatement {
  id: string;
  hackathon_id: string;
  title: string;
  description: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Hackathon {
  id: string;
  event_id: string;
  tagline?: string;
  description?: string;
  theme?: string;
  domain?: string;
  organizing_department?: string;
  mode?: 'Online' | 'Offline' | 'Hybrid' | string;
  venue?: string;
  external_link?: string;
  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  hackathon_starts_at: string;
  hackathon_ends_at: string;
  abstract_submission_deadline?: string | null;
  project_submission_deadline?: string | null;
  demo_pitch_date?: string | null;
  maximum_teams: number;
  minimum_team_size: number;
  maximum_team_size: number;
  maximum_participants?: number;
  eligibility_type?: string;
  allowed_departments?: string;
  allowed_years?: string;
  allowed_colleges?: string;
  rules?: string;
  participation_guidelines?: string;
  submission_guidelines?: string;
  judging_criteria?: string;
  code_of_conduct?: string;
  problem_statement_description?: string;
  required_tech_stack?: string;
  github_url_required?: boolean;
  demo_video_required?: boolean;
  ppt_required?: boolean;
  report_required?: boolean;
  live_demo_required?: boolean;
  prize_1st?: string;
  prize_2nd?: string;
  prize_3rd?: string;
  special_prizes?: string;
  coordinator_id?: string | null;
  created_at?: string;
  updated_at?: string;
  problem_statements?: ProblemStatement[];
}

export interface HackathonTeam {
  team_id: string;
  team_name: string;
  hackathon_id: string;
  leader_id: string;
  passcode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  created_at: string;
  members_count?: number;
}
