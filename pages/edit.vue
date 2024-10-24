<script setup>
    // 状態管理
    const newTodo = useNewTodo(); // 新規Todo登録時の空のオブジェクト
    const todos = useTodos(); // DBから取得したTodo一覧
    const editedTodo = useEditedTodo(); // 編集用のtodoのオブジェクト
    
</script>
<template>
    <!-- Todoの編集テーブル -->
    <table class="table-for-input" v-if="editedTodo">

        <!-- テーブルのヘッダー -->
        <TableHeader />

        <!-- テーブルデータ -->
        <tbody>
            <tr>
                <td>
                <input
                    type="checkbox"
                    name="status"
                    id="status"
                    v-model="editedTodo.status"
                    @change="updateTodo(todo)"
                />
                </td>
                <td>{{ editedTodo.deadline }}</td>
                <td>{{ editedTodo.title }}</td>
                <td>{{ editedTodo.detail }}</td>
                
                <td>
                    <button class="btn-table btn-delete" @click="updateTodo(editedTodo.id)">
                        UPDATE
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <p v-else>編集するTodoが選択されていません。</p>
</template>

<style scoped>
.table-for-input {
    margin: 0 auto;
    width: 65%;
    /* background-color: rgba(0, 100, 200, 0.3); */
}
.table-for-input th {
    width: 20%;
    text-align: right;
}
.table-for-input td,
.table-for-input td input,
.table-for-input td textarea {
    width: 90%;
    max-height: 240px;
}
.table-for-input td textarea {
    resize: vertical;
    min-height: 3rem;
}
#deadline{
    width: 35%;
}
.btn-add {
    border: 2px solid rgba(0, 100, 200, 0.822);
    font-weight: bold;
    border-radius: 4px;
    padding: 0.5rem 2rem;
    display: block;
    margin: 1rem auto;
}
.btn-add:hover {
    background-color: rgba(0, 100, 200, 0.822);
    color: aliceblue;
    transition: 0.3s;
}
</style>