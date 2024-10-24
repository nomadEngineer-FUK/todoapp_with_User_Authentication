<script setup>
import { useAuth } from '#imports';

// 認証状態を取得
const { isAuthenticated } = useAuth();
</script>

<template>
    <!-- ログインしている場合のみヘッダーを表示 -->
    <div v-if="isAuthenticated">
        <TodoHeader />
    </div>

    <!-- ページコンテンツ -->
    <NuxtPage />
    <slot />
</template>
