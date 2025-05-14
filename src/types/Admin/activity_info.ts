export interface ApiActivity {
  ac_id: number;
  ac_name: string;
  ac_company_lecturer: string;
  ac_description: string;
  ac_type: string;
  ac_room: string;
  ac_seat: number;
  ac_food?: string[];
  ac_status: string;
  ac_location_type: string;
  ac_start_register?: Date;
  ac_end_register?: Date;
  ac_create_date?: Date;
  ac_last_update?: Date;
  ac_registered_count: number;
  ac_attended_count?: number;
  ac_not_attended_count?: number;
  ac_start_time?: Date;
  ac_end_time?: Date;
  ac_image_url?: string;
  ac_state: string;
  ac_normal_register: string;
  ac_recieve_hours?: number;
  ac_start_assessment?: Date;
  ac_end_assessment?: Date;
  assessment?: {
    as_id: number;
    as_name: string;
    as_type: string;
    as_description: string;
    as_create_date: string;
    as_last_update?: string;
  } | null;
}