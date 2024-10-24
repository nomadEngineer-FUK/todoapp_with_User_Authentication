<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { fetchTodos } from '@/composables/useTodoLogic';
import Login from '~/components/auth/Login.vue';

const { isAuthenticated, checkUser } = useAuth();


// ページロード時に認証状態を確認
onMounted(async () => {
  await checkUser();  // ページが表示された時に認証状態を確認
});

watchEffect(() => {

  console.log('isAuthenticated in todos.vue: ', isAuthenticated.value);

  if (isAuthenticated.value) {
    fetchTodos();
  }
});


</script>


<template>
  <div v-if="!isAuthenticated">    
    <Login />
  </div>
  <div v-else>
    <ClientOnly>
      <TableForInput />
      <Sort />
      <TableForOutput />
    </ClientOnly>
  </div>

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
