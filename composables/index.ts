import type { Todo } from '../type'; // Todoの型定義をimport
import { useState } from '#app';
import type { User } from '@supabase/supabase-js';

// ====================
//    ** 状態管理 **
// ====================

// DB内のデータ一覧
export const useTodos = () => useState<Todo[]>('todos', () => []);

// 新規登録のTodo
export const useNewTodo = () => useState<Todo>('newTodo', () => ({
  title: '',
  detail: '',
  deadline: '',
  status: false,
  id: 0,
  user_id: ''
}));

// 編集中のTodo
export const useEditedTodo = () => useState<Todo | null>('editedTodo', () => null);

// 編集モードのフラグ
export const useIsEditing = () => useState<boolean>('isEditing', () => false);

// statusの値
export const useIsCompletion = () => useState<boolean>('isCompletion', () => false);

// ソートの基準と順序
// export const useSortField = () => useState<string>('sortField', () => 'id');
export const useSortOrder = () => useState<'asc' | 'desc'>('sortOrder', () => 'asc');

// 選択されているソート順
// export const useSelectedSort = () => useState<'昇順' | '降順'>('selectedSort', () => '昇順');
// 選択可能なソート項目の型定義
type SortType = 'id' | 'title' | 'deadline';

// ソート項目の管理
export const useSelectedSort = () => useState<SortType>('selectedSort', () => 'id');

// ソートされたTodo
export const useSortedTodos = () => useState<Todo[]>('sortedTodos', () => []);


// USER


// 認証関連
  // 現在のユーザー情報
  export const useAuthUser = () => useState<User | null>('authUser', () => null);

  // 認証が完了しているかどうかのフラグ
  export const useIsAuthenticated = () => useState<boolean>('isAuthenticated', () => false);
