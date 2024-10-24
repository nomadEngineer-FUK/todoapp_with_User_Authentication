<script setup lang="ts">
import { watchEffect } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { fetchTodos } from '@/composables/useTodoLogic';
import Login from '~/components/auth/Login.vue';

const { isAuthenticated } = useAuth();
const router = useRouter(); // ルーターのインスタンスを取得

// onMounted で認証状態をチェックし、リダイレクトを行う
onMounted(() => {
  if (isAuthenticated.value) {
    // ログイン済みの場合は自動的に /todos へリダイレクト
    router.push('/todos');
  }
});

watchEffect(() => {
  console.log('isAuthenticated:', isAuthenticated.value);

  // ログイン済みの場合はタスクを取得
  if (isAuthenticated.value) {
    fetchTodos();
  }
});
</script>


<template>
  <div v-if="!isAuthenticated">    
    <Login />
  </div>
  <!-- ログイン済みの場合、/todos に自動リダイレクトします -->

</template>

<style>
* {
  color: #333333;
}
/* ボタンの装飾をリセット */
button{
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
  font-size: small;
}

</style>
