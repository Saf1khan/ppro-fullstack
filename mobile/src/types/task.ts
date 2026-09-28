export interface Task {
  id: string;
  category_id: string;
  name: string;
  short_description: string;
  display_order: number;
  category_name?: string;
}

export interface CategoryWithTasks {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  display_order: number;
  tasks: Task[];
}

export interface SelectTasksPayload {
  task_ids: string[];
}

export interface SelectedTasksResponse {
  total_count: number;
  tasks: Task[];
}
