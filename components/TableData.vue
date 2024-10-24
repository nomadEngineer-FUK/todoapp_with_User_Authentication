<script setup lang="ts">
import type { Todo } from '../type';
import { onMounted, ref, watch } from 'vue';
// import { fetchTodos, sortedTodosList } from '../composables/useTodoLogic'; 
import { useTodos } from '../composables/index'; // データベースからのtodos

// 状態管理
const todos = useTodos();     // DBから取得したTodo一覧
const isLoading = ref(true);  // ローディングフラグ
const { user, isAuthenticated, isAdmin } = useAuth();

// 初期ロード時の処理
onMounted(async() => {
    if (!todos.value.length) {
        console.log('Loading todos from DB...');
        await fetchTodos();
    };
    isLoading.value = false;
});

// 編集ボタンが押下されたら編集モード
const editTodo = (todo: Todo) => {
    setEditMode(todo); // 対象のタスク情報を引数として編集モード
};

// 編集と削除ボタンの表示制御
const canEditAndDelete = (todo: Todo): boolean => {
    // 管理者か、自分が作成したTodoであれば許可
    return isAdmin() || todo.user_id === user.value?.id;
};

</script>

<template>
    <!-- ローディング状態の表示 -->
    <tbody v-if="isLoading">
        <tr>
            <td colspan="7" class="loading-now">Loading your todos ...</td>
        </tr>
    </tbody>

    <!-- Todosの表示テーブル -->
    <tbody v-else-if="todos.length > 0">
        <tr
            v-for="todo in sortedTodosList"
            :key="todo.id"
        >
            <td>{{ todo.id }}</td>
            <td>
            <input
                type="checkbox"
                name="status"
                id="status"
                v-model="todo.status"
                @change="updateTodo(todo)"
            />
            </td>
            <td>{{ todo.deadline }}</td>
            <td>{{ todo.title }}</td>
            <td>{{ todo.detail }}</td>
            <td>
                <button
                    class="btn-table btn-edit"
                    v-if="canEditAndDelete(todo)"
                    @click="editTodo(todo)">
                        Edit
                </button>
            </td>
            <td>
                <button
                    class="btn-table btn-delete"
                    v-if="canEditAndDelete(todo)"
                    @click="deleteTodo(todo)">
                        Del
                </button>
            </td>
        </tr>
    </tbody>

    <!-- todoが登録されていない場合 -->
    <tbody v-else>
        <tr>
            <td colspan="7">
                <p>No todos available.<br>
                Start by adding your first Todo to get organized!</p>
            </td>
        </tr>
    </tbody>
</template>

<style scoped>
.loading-now {
    padding: 6rem 0;
    border: none;
    font-weight: bold;
}
.tbody th, tbody td {
    border: 1px solid rgba(100,100,100,0.2);
}
.btn-table {
    margin: 0.1rem;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
}
.btn-table:hover {
    opacity: 0.6;
    transition: 0.3s;
}
.btn-edit {
    background-color: bisque;  
}
.btn-delete {
    background-color: gray;
    color: aliceblue;
}
.none-todos {
    text-align: center;
    font-weight: bold;
    margin-top: 5rem;
}
</style>
