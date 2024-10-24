/**
 * Todoの型
 * @typedef {Object} Todo
 * @property {string}  title    Todoのタイトル
 * @property {string}  detail   Todoの詳細
 * @property {string}  deadline Todoの期日
 * @property {boolean} status   Todoの完了/未完了
 */
export type Todo = {
    title: string,
    detail: string | null,
    deadline: string | null,
    status: boolean,
    id: number,
    user_id: string,
    role?: string;
};

declare module '#app' {
    interface NuxtApp {
      $supabase: any; // 必要に応じてSupabaseの型を明確に定義
    }
  }
