<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRoute, useRouter  } from 'vue-router';

const { login, user, checkUser } = useAuth();
const email = ref<string>('');
const password = ref<string>('');
const route =  useRoute();
const router = useRouter();
const logoutMessage = computed(() => (route.query.message as string) || '');
const isLoading = ref(false);

onMounted(async () => {
  await checkUser();  // ページが読み込まれたときに現在のユーザー認証状態を確認
});

const loginUser = async () => {
  try {
    await login(email.value, password.value, isLoading);
    console.log('Login succeeded. Your Email: ' + email.value);
    router.push('/todos'); // 登録成功後にhomeページにリダイレクト（認証済の場合はtodo一覧が表示される）

  } catch (error) {
    console.error('Login error:', (error as Error).message);
  }
};


</script>

<template>
    <div>
        <div class="login-page">
            <h1 class="welcome-our-page">Welcome to our Todo App!</h1>

            <!-- ログアウトメッセージ -->
            <p v-if="logoutMessage">{{ logoutMessage }}</p>

            <!-- 未ログインの場合 -->
            <div class="login-container" v-if="!user">
                <h2 class="login-header">Login to Your Account</h2>
                
                <form class="login-signup-form" @submit.prevent="loginUser">
                    <label for="login-id">Email: </label>
                    <input id="login-id" name="login-id" v-model="email" placeholder="Enter your Email" type="email" />

                    <label for="signup-password">Password:</label>
                    <input id="signup-password" name="signup-password" v-model="password" placeholder="Enter your Password" type="password" />

                    <button :disabled="isLoading" class="btn-login-or-signup btn-login" type="submit">
                        {{ isLoading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>

                <!-- アカウント未登録の場合 -->
                <div class="signup-new-account">
                    <h4 class="new-to-our-app">New to our app?</h4>
                    <NuxtLink to="/register" class="btn-login-or-signup btn-signup">
                        Sign up here
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
  
<style scoped>
.welcome-our-page {
    text-align: center;
}
.login-page {
   position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.login-container {
    border-radius: 16px;
    padding: 3rem;
    background-color: rgba(175, 238, 238, 0.3);
}
.login-header {
    text-align: center;
}
.login-signup-form {
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
}
.login-signup-form input {
    margin-bottom: 1.5rem;
    min-height: 2rem;
    border-radius: 4px;
}

.btn-login-or-signup {
    margin: 0.1rem;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    font-weight: bold;
}
.btn-login-or-signup:hover {
    opacity: 0.6;
    transition: 0.3s;
}
.btn-login {
    border: 3px solid rgba(0, 100, 200, 0.822);
    background-color: rgba(0, 100, 200, 0.822);
    color: aliceblue;
}


/* アカウント未登録の場合 */
.signup-new-account {
    margin: 2rem;
    text-align: center;
    border-top: 1px solid rgba(100,100,100,0.2);
}
.new-to-our-app {
    margin: 2rem 0;
}
.btn-signup {
    border: 3px solid rgba(150, 20, 60, 0.6);
    color: rgba(150, 20, 60, 0.6);
    text-decoration: none;
}
.btn-signup:hover {
    background-color: rgba(150, 20, 60, 0.6);
    color: aliceblue;
}
</style>
  