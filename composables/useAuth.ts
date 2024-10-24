import { useNuxtApp } from '#app';
import { useAuthUser, useIsAuthenticated } from './index';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'vue-router';
import { ref } from 'vue';



// 認証関連のロジックを共通で管理
export const useAuth = () => {
    const user = useAuthUser(); // 認証されたユーザー情報を取得
    const router = useRouter(); // Vue Router を使ってリダイレクト処理を行う
    const { $supabase } = useNuxtApp();
    const isAuthenticated = useIsAuthenticated(); // 認証状態を取得
    
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60分 (ミリ秒)
    const timeoutId = ref<NodeJS.Timeout | null>(null); // タイムアウトIDを管理

    // ログイン関数
    const login = async (email: string, password: string, isLoading: Ref<boolean>): Promise<User | null> => {
        isLoading.value = true; // ローディング開始

        try {
            const { data, error } = await $supabase
                .auth.signInWithPassword({ email, password });
            
            if (error) throw new Error(error.message);

            if (data.user) {
                user.value = data.user;
                isAuthenticated.value = true;
                console.log('User authenticated:', user.value);
                router.push('/todos'); // 認証成功後にtodosページにリダイレクト
            };

        } catch(err) {
            console.error('Login error:', err);

        } finally {
            isLoading.value = false; // ローディング終了
        };

        return user.value;
      };
  
    // ログアウト関数
    const logout = async (reason?: string): Promise<void> => {
        const { error } = await $supabase.auth.signOut();
        if (error) throw new Error(error.message);

        user.value = null;
        isAuthenticated.value = false;
        clearInactivityTimer();

        // ログアウト時の理由をクエリパラメータに追加
        const redirectQuery = reason ? { query: { message: reason }} : {};
        router.push({ path: '/', ...redirectQuery }); // ログアウト後にログインページにリダイレクト
    };
  
    // アカウント登録関数
    const signUp = async (email: string, password: string, isLoading: Ref<boolean>): Promise<User | null> => {
      isLoading.value = true; // ローディング開始
  
      try {
          // ストアドプロシージャを使用してユーザー数を取得
          const { data: userCountData, error: countError } = await $supabase.rpc('get_user_count');

          if (countError) {
              console.error('Error checking user count:', countError.message);
              throw new Error('Failed to check user count.');
          }

          const existingUserCount = userCountData || 0;
          console.log('Existing User Count:', existingUserCount);


  
          // ユーザーを登録
          const { data, error } = await $supabase.auth.signUp({ email, password });
  
          if (error) {
              console.error('Failed to sign up:', error.message);
              throw new Error(error.message);
          }
  
          if (data.user) {
              user.value = data.user;
  
              // 最初のユーザーなら「admin」、それ以降は「user」として設定
              const role = (existingUserCount === 0) ? 'admin' : 'user';
  
              // ユーザー情報の挿入
              const { error: insertError } = await $supabase
                  .from('users')
                  .insert([
                      {
                          id: data.user.id,
                          email: data.user.email,
                          role: role
                      }
                  ]);
  
              if (insertError) {
                  console.error('Failed to set user role:', insertError.message);
                  throw new Error('User role assignment failed.');
              } else {
                  console.log('User successfully inserted:', data.user.email);
              }
  
              await router.push('/verify-email');  // 登録成功後にメールでの認証を促すページにリダイレクト
          }
  
      } catch (err) {
          console.error('Login error:', err);
  
      } finally {
          isLoading.value = false; // ローディング終了
      }
      return user.value;
  };
  
  
    // ユーザーの認証状態を確認
    const checkUser = async (): Promise<void> => {
        const { data, error } = await $supabase.auth.getSession();
      
        if (error) {
          console.error('Error getting session:', error.message);
          return;
        }
      
        console.log('Session data:', data);       // セッションデータの確認

        user.value = data?.session?.user as User ?? null; // セッションのuserを確認
        isAuthenticated.value = !!user.value;

        if (isAuthenticated.value && user.value?.id) {
          // ロールを取得して、ユーザーオブジェクトに追加
          const role = await fetchUserRole(user.value.id);
          if (role) {
              user.value.role = role;
              console.log('User Role:', role);
          };
        };

        if (isAuthenticated.value) {
            startInactivityTimer(); // 認証状態が確認されたらタイマーをスタート
        };
    };

    

    const fetchUserRole = async (userId: string): Promise<string | null> => {
      const { $supabase } = useNuxtApp();

      const { data, error } = await $supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

        if (error) {
          console.error('Failed to fetch user role:', error.message);
          return null;
      };

      console.log('data?.role.id: '+ data);
      console.log('userId: ' + userId)

      return data?.role || null;
    };


    // アクティビティタイマーの処理
  const startInactivityTimer = (): void => {
    clearInactivityTimer(); // 既存のタイマーをクリア

    timeoutId.value = setTimeout(() => {
        console.log('自動ログアウト: 一定時間操作がありませんでした');
        logout('*You have been automatically logged out due to inactivity.'); // 自動ログアウト
    }, INACTIVITY_TIMEOUT);
  };

  const clearInactivityTimer = (): void => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
      timeoutId.value = null;
    };
  };

  const resetInactivityTimer = (): void => {
    if (isAuthenticated.value) {
      startInactivityTimer();
    };
  };
  
  // ページのアクティビティ（マウス、キーボード、スクロール）を監視
  if (typeof window !== 'undefined') { // クライアントサイドであることを確認
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
  };


  const isAdmin = (): boolean => {
    const result = user.value?.role === 'admin';
    console.log('Authenticated User:', user.value);
    console.log('role: ' + user.value?.role);
    console.log('Is Admin:', result); // デバッグ用
    return result;
};

  return {
    user,
    isAuthenticated,
    login,
    logout,
    signUp,
    checkUser,
    startInactivityTimer,
    clearInactivityTimer,
    isAdmin
  };
};


